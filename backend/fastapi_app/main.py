import os, json, asyncio
from decimal import Decimal
from django.db.models import Sum, Avg
from uuid import uuid4

# from fastapi import Cookie, Header

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
import django

django.setup()
import redis.asyncio as aioredis
from fastapi import (
    FastAPI,
    WebSocket,
    WebSocketDisconnect,
    HTTPException,
    Depends,
    Header,
    Cookie,
)
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from openai import OpenAI
from store.models import *
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import AccessToken
import razorpay
from django.db import transaction
import redis.asyncio as aioredis
import redis
from asgiref.sync import sync_to_async
from contextlib import asynccontextmanager
from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile, File
from fastapi.staticfiles import StaticFiles
from django.conf import settings

ORIGINS = [
    x.strip()
    for x in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
    if x.strip()
]

REDIS = os.getenv("REDIS_URL", "redis://localhost:6379/0")

redis_client = redis.from_url(
    REDIS,
    decode_responses=True,
)


class ConnectionManager:
    def __init__(self):
        self.connections = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.connections.add(websocket)

        print(f"WebSocket connected. " f"Total connections: {len(self.connections)}")

    def disconnect(self, websocket: WebSocket):
        self.connections.discard(websocket)

        print(f"WebSocket disconnected. " f"Total connections: {len(self.connections)}")

    async def broadcast(self, message: dict):
        print(
            f"Broadcasting message to "
            f"{len(self.connections)} connection(s): {message}"
        )

        disconnected = []

        for websocket in list(self.connections):
            try:
                await websocket.send_json(message)

            except Exception as e:
                print("WebSocket send error:", str(e))
                disconnected.append(websocket)

        for websocket in disconnected:
            self.disconnect(websocket)


manager = ConnectionManager()


# async def listen():
#     try:
#         r = aioredis.from_url(REDIS, decode_responses=True)
#         p = r.pubsub()
#         await p.subscribe("jeeva_events")
#         async for x in p.listen():
#             if x.get("type") == "message":
#                 await m.send(json.loads(x["data"]))
#     except asyncio.CancelledError:
#         pass
#     except Exception:
#         pass


@asynccontextmanager
async def life(app):
    print("FastAPI application started")
    yield
    print("FastAPI application stopped")


razorpay_client = razorpay.Client(
    auth=(
        os.getenv("RAZORPAY_KEY_ID"),
        os.getenv("RAZORPAY_KEY_SECRET"),
    )
)


app = FastAPI(title="Jeeva Herbs API", lifespan=life)


app.add_middleware(
    CORSMiddleware,
    allow_origins=ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MEDIA_ROOT = Path(settings.MEDIA_ROOT)
PRODUCT_MEDIA_DIR = MEDIA_ROOT / "products"

PRODUCT_MEDIA_DIR.mkdir(parents=True, exist_ok=True)

app.mount(
    "/media",
    StaticFiles(directory=str(MEDIA_ROOT)),
    name="media",
)


def get_current_user(
    authorization: str | None = Header(default=None),
    access_token_cookie: str | None = Cookie(
        default=None,
        alias="access_token",
    ),
):
    token = None

    # 1. Authorization header
    if authorization:
        if not authorization.startswith("Bearer "):
            raise HTTPException(
                status_code=401,
                detail="Invalid authorization header",
            )

        token = authorization.replace("Bearer ", "").strip()

    # 2. HttpOnly cookie
    elif access_token_cookie:
        token = access_token_cookie

    else:
        raise HTTPException(
            status_code=401,
            detail="Authentication required",
        )

    try:
        access_token = AccessToken(token)
        user_id = access_token["user_id"]
        user = User.objects.get(id=user_id)

    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token",
        )

    return user


def admin_required(
    current_user: User = Depends(get_current_user),
):
    if not current_user.is_staff:
        raise HTTPException(
            status_code=403,
            detail="Admin access required",
        )

    return current_user


class Item(BaseModel):
    product_id: int
    variant_id: int
    quantity: int = Field(ge=1, le=100)


class ProductVariantIn(BaseModel):
    id: int | None = None
    unit: str
    price: Decimal
    stock: int = Field(ge=0)
    is_active: bool = True


class ProductIn(BaseModel):
    name: str
    slug: str
    tag: str = ""
    category: str
    description: str = ""
    ingredients: list[str] = []
    price: Decimal
    unit: str
    stock: int = Field(ge=0)
    image_url: str = ""
    hover_image_url: str = ""
    is_active: bool = True
    variants: list[ProductVariantIn] = []


class OrderIn(BaseModel):
    customer_name: str
    phone: str
    email: str = ""
    address: str
    pincode: str
    payment_method: str = "cod"
    items: list[Item]


class Chat(BaseModel):
    message: str
    history: list[dict] = []


class PaymentItem(BaseModel):
    product_id: int
    variant_id: int
    quantity: int


class PaymentOrderRequest(BaseModel):
    items: list[PaymentItem]


class PaymentVerifyRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

    customer_name: str
    phone: str
    email: str
    address: str
    pincode: str

    items: list[Item]


class ReviewCreate(BaseModel):
    product_id: int
    order_number: str
    rating: int = Field(ge=1, le=5)
    review: str = ""


def pd(p):
    return {
        "id": p.id,
        "name": p.name,
        "slug": p.slug,
        "tag": p.tag,
        "category": p.category,
        "description": p.description,
        "ingredients": p.ingredients,
        "price": float(p.price),
        "unit": p.unit,
        "stock": p.stock,
        "image_url": p.image_url,
        "hover_image_url": p.hover_image_url,
        "is_active": p.is_active,
        "variants": [
            {
                "id": v.id,
                "unit": v.unit,
                "price": float(v.price),
                "stock": v.stock,
                "is_active": v.is_active,
            }
            for v in p.variants.all()
        ],
        "in_stock": p.stock > 0,
    }


@app.post("/api/products/upload-image")
async def upload_product_image(
    file: UploadFile = File(...),
    current_user: User = Depends(admin_required),
):
    allowed_types = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
    }

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, PNG and WEBP images are allowed",
        )

    contents = await file.read()

    # 5 MB limit
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="Image size must be less than 5 MB",
        )

    extension = allowed_types[file.content_type]

    filename = f"{uuid4().hex}{extension}"
    file_path = PRODUCT_MEDIA_DIR / filename

    with open(file_path, "wb") as buffer:
        buffer.write(contents)

    image_url = f"{settings.MEDIA_URL}products/{filename}"

    return {
        "success": True,
        "image_url": image_url,
        "filename": filename,
    }


@app.get("/api/products")
def products():
    return [pd(p) for p in Product.objects.filter(is_active=True)]


@app.get("/api/products/{product_id}")
def get_product(product_id: int):
    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        raise HTTPException(status_code=404, detail="Product not found")

    return pd(product)


@app.post("/api/products")
def create_product(d: ProductIn, admin=Depends(admin_required)):
    if Product.objects.filter(slug=d.slug).exists():
        raise HTTPException(
            status_code=400, detail="Product with this slug already exists"
        )

    product = Product.objects.create(
        name=d.name,
        slug=d.slug,
        tag=d.tag,
        category=d.category,
        description=d.description,
        ingredients=d.ingredients,
        price=d.price,
        unit=d.unit,
        stock=d.stock,
        image_url=d.image_url,
        hover_image_url=d.hover_image_url,
        is_active=d.is_active,
    )

    for variant in d.variants:
        ProductVariant.objects.create(
            product=product,
            unit=variant.unit,
            price=variant.price,
            stock=variant.stock,
            is_active=variant.is_active,
        )

    return {
        "success": True,
        "message": "Product created successfully",
        "product": pd(product),
    }


@app.put("/api/products/{product_id}")
def update_product(
    product_id: int,
    d: ProductIn,
    admin=Depends(admin_required),
):
    # ---------------------------------------------------------
    # 1. GET PRODUCT
    # ---------------------------------------------------------
    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        raise HTTPException(
            status_code=404,
            detail="Product not found",
        )

    # ---------------------------------------------------------
    # 2. CHECK SLUG
    # ---------------------------------------------------------
    if Product.objects.filter(slug=d.slug).exclude(id=product_id).exists():

        raise HTTPException(
            status_code=400,
            detail="Product with this slug already exists",
        )

    # ---------------------------------------------------------
    # 3. UPDATE PRODUCT DETAILS
    # ---------------------------------------------------------
    product.name = d.name
    product.slug = d.slug
    product.tag = d.tag
    product.category = d.category
    product.description = d.description
    product.ingredients = d.ingredients

    # Legacy/default product values
    product.price = d.price
    product.unit = d.unit
    product.stock = d.stock

    # Images
    product.image_url = d.image_url
    product.hover_image_url = d.hover_image_url

    product.is_active = d.is_active

    product.save()

    # ---------------------------------------------------------
    # 4. UPDATE VARIANTS
    # ---------------------------------------------------------

    existing_variants = {
        variant.id: variant
        for variant in ProductVariant.objects.filter(product=product)
    }

    received_variant_ids = set()

    for variant_data in d.variants:

        # -----------------------------------------------------
        # IMPORTANT
        # Existing variant ID frontend sends
        # -----------------------------------------------------
        variant_id = getattr(
            variant_data,
            "id",
            None,
        )

        # -----------------------------------------------------
        # Existing Variant
        # -----------------------------------------------------
        if variant_id and variant_id in existing_variants:

            variant = existing_variants[variant_id]

            variant.unit = variant_data.unit
            variant.price = variant_data.price
            variant.stock = variant_data.stock
            variant.is_active = variant_data.is_active

            variant.save()

            received_variant_ids.add(variant_id)

        # -----------------------------------------------------
        # New Variant
        # -----------------------------------------------------
        else:

            new_variant = ProductVariant.objects.create(
                product=product,
                unit=variant_data.unit,
                price=variant_data.price,
                stock=variant_data.stock,
                is_active=variant_data.is_active,
            )

            received_variant_ids.add(new_variant.id)

    # ---------------------------------------------------------
    # 5. DELETE REMOVED VARIANTS
    # ---------------------------------------------------------

    for variant_id, variant in existing_variants.items():

        if variant_id not in received_variant_ids:
            variant.delete()

    # ---------------------------------------------------------
    # 6. RETURN UPDATED PRODUCT
    # ---------------------------------------------------------

    return {
        "success": True,
        "message": "Product updated successfully",
        "product": pd(product),
    }


@app.delete("/api/products/{product_id}")
def deactivate_product(product_id: int, admin=Depends(admin_required)):
    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        raise HTTPException(status_code=404, detail="Product not found")

    product.is_active = False
    product.save(update_fields=["is_active", "updated_at"])

    return {
        "success": True,
        "message": "Product deactivated successfully",
        "product": pd(product),
    }


@app.get("/api/faqs")
def faqs():
    return [
        {"id": f.id, "question": f.question, "answer": f.answer}
        for f in FAQ.objects.filter(active=True)
    ]


@app.get("/api/admin/dashboard")
def admin_dashboard(
    admin=Depends(admin_required),
):
    total_products = Product.objects.count()

    total_orders = Order.objects.count()

    total_customers = User.objects.filter(is_staff=False).count()

    delivered_revenue = Order.objects.filter(status="delivered").aggregate(
        total=Sum("total")
    ).get("total") or Decimal("0")

    low_stock_products = Product.objects.filter(is_active=True, stock__lte=10).count()

    pending_orders = Order.objects.filter(status="pending").count()

    return {
        "total_products": total_products,
        "total_orders": total_orders,
        "total_customers": total_customers,
        "revenue": float(delivered_revenue),
        "low_stock_products": low_stock_products,
        "pending_orders": pending_orders,
    }


@app.get("/api/admin/customers")
def admin_customers(
    admin=Depends(admin_required),
):
    customers = User.objects.filter(is_staff=False).order_by("-date_joined")

    result = []

    for customer in customers:
        orders = Order.objects.filter(user=customer)

        total_orders = orders.count()

        total_spent = orders.filter(status="delivered").aggregate(
            total=Sum("total")
        ).get("total") or Decimal("0")

        result.append(
            {
                "id": customer.id,
                "name": customer.get_full_name() or customer.username,
                "username": customer.username,
                "email": customer.email,
                "date_joined": customer.date_joined.isoformat(),
                "total_orders": total_orders,
                "total_spent": float(total_spent),
            }
        )

    return result


@app.post("/api/orders")
def orders(
    d: OrderIn,
    current_user: User = Depends(get_current_user),
):
    subtotal = Decimal("0")
    ready = []

    for i in d.items:

        # ---------------------------------------------------------
        # 1. GET PRODUCT
        # ---------------------------------------------------------
        try:
            product = Product.objects.get(
                id=i.product_id,
                is_active=True,
            )
        except Product.DoesNotExist:
            raise HTTPException(
                status_code=404,
                detail="Product not found",
            )

        # ---------------------------------------------------------
        # 2. GET SELECTED VARIANT
        # ---------------------------------------------------------
        try:
            variant = ProductVariant.objects.get(
                id=i.variant_id,
                product=product,
                is_active=True,
            )
        except ProductVariant.DoesNotExist:
            raise HTTPException(
                status_code=404,
                detail="Product variant not found",
            )

        # ---------------------------------------------------------
        # 3. CHECK VARIANT STOCK
        # ---------------------------------------------------------
        if variant.stock < i.quantity:
            raise HTTPException(
                status_code=409,
                detail=(
                    f"Only {variant.stock} available "
                    f"for {product.name} - {variant.unit}"
                ),
            )

        # ---------------------------------------------------------
        # 4. CALCULATE USING VARIANT PRICE
        # ---------------------------------------------------------
        line_total = variant.price * i.quantity

        subtotal += line_total

        ready.append(
            {
                "product": product,
                "variant": variant,
                "quantity": i.quantity,
                "line_total": line_total,
            }
        )

    # ---------------------------------------------------------
    # 5. DELIVERY FEE
    # ---------------------------------------------------------
    delivery_fee = Decimal("0") if subtotal >= Decimal("499") else Decimal("50")

    total = subtotal + delivery_fee

    # ---------------------------------------------------------
    # 6. CREATE ORDER
    # ---------------------------------------------------------
    order = Order.objects.create(
        user=current_user,
        order_number="JH" + uuid4().hex[:10].upper(),
        customer_name=d.customer_name,
        phone=d.phone,
        email=d.email,
        address=d.address,
        pincode=d.pincode,
        payment_method=d.payment_method,
        payment_status="pending",
        status="pending",
        subtotal=subtotal,
        delivery_fee=delivery_fee,
        total=total,
    )

    # ---------------------------------------------------------
    # 7. CREATE ORDER ITEMS + REDUCE VARIANT STOCK
    # ---------------------------------------------------------
    for item_data in ready:

        product = item_data["product"]
        variant = item_data["variant"]
        quantity = item_data["quantity"]
        line_total = item_data["line_total"]

        OrderItem.objects.create(
            order=order,
            product=product,
            variant=variant,
            product_name=product.name,
            quantity=quantity,
            unit_price=variant.price,
            line_total=line_total,
        )

        # Reduce selected variant stock
        variant.stock -= quantity

        variant.save(
            update_fields=[
                "stock",
                "updated_at",
            ]
        )

        # ---------------------------------------------------------
        # SYNC PRODUCT TOTAL STOCK
        # ---------------------------------------------------------
        total_product_stock = (
            ProductVariant.objects.filter(
                product=product,
                is_active=True,
            )
            .aggregate(total=Sum("stock"))
            .get("total")
            or 0
        )

        product.stock = total_product_stock

        product.save(
            update_fields=[
                "stock",
                "updated_at",
            ]
        )

    # ---------------------------------------------------------
    # 8. RESPONSE
    # ---------------------------------------------------------
    return {
        "success": True,
        "order_number": order.order_number,
        "subtotal": float(subtotal),
        "delivery_fee": float(delivery_fee),
        "total": float(total),
        "status": order.status,
    }


@app.get("/api/orders")
def my_orders(
    current_user: User = Depends(get_current_user),
):
    print(current_user, "current_user")
    orders = (
        Order.objects.filter(user=current_user)
        .prefetch_related("items")
        .order_by("-created_at")
    )

    result = []

    for o in orders:
        result.append(
            {
                "order_number": o.order_number,
                "customer_name": o.customer_name,
                "phone": o.phone,
                "email": o.email,
                "address": o.address,
                "pincode": o.pincode,
                "payment_method": o.payment_method,
                "payment_status": o.payment_status,
                "status": o.status,
                "subtotal": float(o.subtotal),
                "delivery_fee": float(o.delivery_fee),
                "total": float(o.total),
                "created_at": o.created_at.isoformat(),
                "items": [
                    {
                        "product_id": item.product_id,
                        "product_name": item.product_name,
                        "variant_id": item.variant_id if item.variant else None,
                        "pack_size": item.variant.unit if item.variant else None,
                        "quantity": item.quantity,
                        "unit_price": float(item.unit_price),
                        "line_total": float(item.line_total),
                        "reviewed": ProductReview.objects.filter(
                            product_id=item.product_id,
                            user=current_user,
                            order=o,
                        ).exists(),
                        "review": (
                            ProductReview.objects.filter(
                                product_id=item.product_id,
                                user=current_user,
                                order=o,
                            )
                            .values(
                                "id",
                                "rating",
                                "review",
                            )
                            .first()
                        ),
                    }
                    for item in o.items.all()
                ],
            }
        )

    return result


@app.get("/api/orders/{num}")
def order_detail(
    num: str,
    current_user: User = Depends(get_current_user),
):
    try:
        o = Order.objects.prefetch_related("items").get(
            order_number=num,
            user=current_user,
        )

    except Order.DoesNotExist:
        raise HTTPException(status_code=404, detail="Order not found")

    return {
        "order_number": o.order_number,
        "customer_name": o.customer_name,
        "phone": o.phone,
        "email": o.email,
        "address": o.address,
        "pincode": o.pincode,
        "payment_method": o.payment_method,
        "payment_status": o.payment_status,
        "status": o.status,
        "subtotal": float(o.subtotal),
        "delivery_fee": float(o.delivery_fee),
        "total": float(o.total),
        "created_at": o.created_at.isoformat(),
        "items": [
            {
                "product_id": item.product_id,
                "product_name": item.product_name,
                "variant_id": item.variant_id if item.variant else None,
                "pack_size": item.variant.unit if item.variant else None,
                "quantity": item.quantity,
                "unit_price": float(item.unit_price),
                "line_total": float(item.line_total),
            }
            for item in o.items.all()
        ],
    }


@app.post("/api/reviews")
def create_review(
    data: ReviewCreate,
    current_user: User = Depends(get_current_user),
):
    # ---------------------------------------------------------
    # 1. GET ORDER
    # ---------------------------------------------------------
    try:
        order = Order.objects.get(
            order_number=data.order_number,
            user=current_user,
        )
    except Order.DoesNotExist:
        raise HTTPException(
            status_code=404,
            detail="Order not found",
        )

    # ---------------------------------------------------------
    # 2. ONLY DELIVERED ORDERS CAN BE REVIEWED
    # ---------------------------------------------------------
    if order.status != "delivered":
        raise HTTPException(
            status_code=400,
            detail="You can review a product only after the order is delivered",
        )

    # ---------------------------------------------------------
    # 3. GET PRODUCT
    # ---------------------------------------------------------
    try:
        product = Product.objects.get(
            id=data.product_id,
            is_active=True,
        )
    except Product.DoesNotExist:
        raise HTTPException(
            status_code=404,
            detail="Product not found",
        )

    # ---------------------------------------------------------
    # 4. CHECK PRODUCT WAS PURCHASED IN THIS ORDER
    # ---------------------------------------------------------
    purchased = OrderItem.objects.filter(
        order=order,
        product=product,
    ).exists()

    if not purchased:
        raise HTTPException(
            status_code=403,
            detail="You can review only products purchased in this order",
        )

    # ---------------------------------------------------------
    # 5. PREVENT DUPLICATE REVIEW
    # ---------------------------------------------------------
    existing_review = ProductReview.objects.filter(
        product=product,
        user=current_user,
        order=order,
    ).first()

    if existing_review:
        raise HTTPException(
            status_code=409,
            detail="You have already reviewed this product for this order",
        )

    # ---------------------------------------------------------
    # 6. CREATE REVIEW
    # ---------------------------------------------------------
    new_review = ProductReview.objects.create(
        product=product,
        user=current_user,
        order=order,
        rating=data.rating,
        review=data.review.strip(),
    )

    return {
        "success": True,
        "message": "Review submitted successfully",
        "review": {
            "id": new_review.id,
            "product_id": product.id,
            "product_name": product.name,
            "rating": new_review.rating,
            "review": new_review.review,
            "created_at": new_review.created_at.isoformat(),
        },
    }


@app.put("/api/reviews/{review_id}")
def update_review(
    review_id: int,
    d: ReviewCreate,
    current_user: User = Depends(get_current_user),
):
    try:
        review = ProductReview.objects.get(
            id=review_id,
            user=current_user,
        )
    except ProductReview.DoesNotExist:
        raise HTTPException(
            status_code=404,
            detail="Review not found",
        )

    # Make sure this review belongs to the selected product
    if review.product_id != d.product_id:
        raise HTTPException(
            status_code=400,
            detail="Invalid product",
        )

    review.rating = d.rating
    review.review = d.review.strip()

    review.save(
        update_fields=[
            "rating",
            "review",
            "updated_at",
        ]
    )

    return {
        "success": True,
        "message": "Review updated successfully",
        "review": {
            "id": review.id,
            "product_id": review.product_id,
            "rating": review.rating,
            "review": review.review,
        },
    }


@app.get("/api/products/{product_id}/reviews")
def get_product_reviews(product_id: int):
    try:
        product = Product.objects.get(
            id=product_id,
            is_active=True,
        )
    except Product.DoesNotExist:
        raise HTTPException(
            status_code=404,
            detail="Product not found",
        )

    reviews = ProductReview.objects.filter(
        product=product,
        is_approved=True,
    ).select_related("user")

    total_reviews = reviews.count()

    average_rating = (
        reviews.aggregate(average=Avg("rating")).get("average") if total_reviews else 0
    )

    # if total_reviews:
    #     average_rating = average_rating / total_reviews
    # else:
    #     average_rating = 0

    return {
        "product_id": product.id,
        "average_rating": round(float(average_rating), 1),
        "total_reviews": total_reviews,
        "reviews": [
            {
                "id": review.id,
                "user_name": (review.user.get_full_name() or review.user.username),
                "rating": review.rating,
                "review": review.review,
                "created_at": review.created_at.isoformat(),
            }
            for review in reviews
        ],
    }


@app.post("/api/payments/create-order")
def create_payment_order(
    data: PaymentOrderRequest,
    current_user: User = Depends(get_current_user),
):
    if not data.items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    subtotal = Decimal("0")

    for item in data.items:

        try:
            product = Product.objects.get(
                id=item.product_id,
                is_active=True,
            )
        except Product.DoesNotExist:
            raise HTTPException(
                status_code=404,
                detail="Product not found",
            )

        try:
            variant = ProductVariant.objects.get(
                id=item.variant_id,
                product=product,
                is_active=True,
            )
        except ProductVariant.DoesNotExist:
            raise HTTPException(
                status_code=404,
                detail="Product variant not found",
            )

        if variant.stock < item.quantity:
            raise HTTPException(
                status_code=409,
                detail=f"Only {variant.stock} available for {product.name} - {variant.unit}",
            )

        subtotal += variant.price * item.quantity

    delivery_fee = Decimal("0") if subtotal >= Decimal("499") else Decimal("50")

    total = subtotal + delivery_fee

    # Razorpay amount must be in paise
    amount_in_paise = int(total * 100)

    try:
        razorpay_order = razorpay_client.order.create(
            {
                "amount": amount_in_paise,
                "currency": "INR",
                "receipt": f"JH_{current_user.id}_{uuid4().hex[:8]}",
            }
        )
    except Exception as e:
        print("RAZORPAY ERROR TYPE:", type(e).__name__)
        print("RAZORPAY ERROR:", str(e))

        raise HTTPException(status_code=500, detail=f"Razorpay error: {str(e)}")
    return {
        "success": True,
        "razorpay_order_id": razorpay_order["id"],
        "razorpay_key_id": os.getenv("RAZORPAY_KEY_ID"),
        "amount": amount_in_paise,
        "currency": "INR",
        "subtotal": float(subtotal),
        "delivery_fee": float(delivery_fee),
        "total": float(total),
    }


@app.post("/api/payments/verify")
def verify_payment(
    data: PaymentVerifyRequest,
    current_user: User = Depends(get_current_user),
):
    # ---------------------------------------------------------
    # 1. Basic validation
    # ---------------------------------------------------------
    if not data.items:
        raise HTTPException(
            status_code=400,
            detail="Cart is empty",
        )

    # ---------------------------------------------------------
    # 2. Verify Razorpay signature
    # ---------------------------------------------------------
    try:
        razorpay_client.utility.verify_payment_signature(
            {
                "razorpay_order_id": data.razorpay_order_id,
                "razorpay_payment_id": data.razorpay_payment_id,
                "razorpay_signature": data.razorpay_signature,
            }
        )

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Payment verification failed",
        )

    # ---------------------------------------------------------
    # 3. Fetch Razorpay order
    # ---------------------------------------------------------
    try:
        razorpay_order = razorpay_client.order.fetch(data.razorpay_order_id)

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Unable to verify Razorpay order",
        )

    # ---------------------------------------------------------
    # Make sure Razorpay order belongs to this user
    # ---------------------------------------------------------
    expected_receipt_prefix = f"JH_{current_user.id}_"

    if not str(razorpay_order.get("receipt", "")).startswith(expected_receipt_prefix):

        raise HTTPException(
            status_code=403,
            detail="Payment order does not belong to this user",
        )

    # ---------------------------------------------------------
    # 4. Fetch Razorpay payment
    # ---------------------------------------------------------
    try:
        razorpay_payment = razorpay_client.payment.fetch(data.razorpay_payment_id)

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Unable to fetch Razorpay payment",
        )

    # ---------------------------------------------------------
    # Payment must belong to this Razorpay order
    # ---------------------------------------------------------
    if razorpay_payment.get("order_id") != data.razorpay_order_id:

        raise HTTPException(
            status_code=400,
            detail="Payment does not belong to this order",
        )

    # ---------------------------------------------------------
    # 5. Payment must be captured
    # ---------------------------------------------------------
    if razorpay_payment.get("status") != "captured":

        raise HTTPException(
            status_code=400,
            detail="Payment is not captured yet",
        )

    # ---------------------------------------------------------
    # 6. Check currency
    # ---------------------------------------------------------
    if razorpay_payment.get("currency") != "INR":

        raise HTTPException(
            status_code=400,
            detail="Invalid payment currency",
        )

    # ---------------------------------------------------------
    # 7. Prevent duplicate order creation
    # ---------------------------------------------------------
    existing_order = Order.objects.filter(
        razorpay_payment_id=data.razorpay_payment_id
    ).first()

    if existing_order:

        return {
            "success": True,
            "message": "Order already created",
            "order_number": existing_order.order_number,
            "payment_id": existing_order.razorpay_payment_id,
            "status": existing_order.status,
        }

    # ---------------------------------------------------------
    # 8. Recalculate cart amount from DATABASE VARIANTS
    # ---------------------------------------------------------
    subtotal = Decimal("0")

    ready_items = []

    for item in data.items:

        # -----------------------------------------------------
        # Validate quantity
        # -----------------------------------------------------
        if item.quantity <= 0:
            raise HTTPException(
                status_code=400,
                detail="Invalid quantity",
            )

        # -----------------------------------------------------
        # Get product
        # -----------------------------------------------------
        try:
            product = Product.objects.get(
                id=item.product_id,
                is_active=True,
            )

        except Product.DoesNotExist:
            raise HTTPException(
                status_code=404,
                detail="Product not found",
            )

        # -----------------------------------------------------
        # Get selected product variant
        # -----------------------------------------------------
        try:
            variant = ProductVariant.objects.get(
                id=item.variant_id,
                product=product,
                is_active=True,
            )

        except ProductVariant.DoesNotExist:
            raise HTTPException(
                status_code=404,
                detail="Product variant not found",
            )

        # -----------------------------------------------------
        # Check VARIANT stock
        # -----------------------------------------------------
        if variant.stock < item.quantity:

            raise HTTPException(
                status_code=409,
                detail=(
                    f"Only {variant.stock} available "
                    f"for {product.name} - {variant.unit}"
                ),
            )

        # -----------------------------------------------------
        # Calculate price from VARIANT
        # Never trust frontend price
        # -----------------------------------------------------
        line_total = variant.price * item.quantity

        subtotal += line_total

        ready_items.append(
            {
                "product": product,
                "variant": variant,
                "quantity": item.quantity,
                "line_total": line_total,
            }
        )

    # ---------------------------------------------------------
    # Delivery fee
    # ---------------------------------------------------------
    delivery_fee = Decimal("0") if subtotal >= Decimal("499") else Decimal("50")

    total = subtotal + delivery_fee

    # ---------------------------------------------------------
    # 9. Verify Razorpay amount
    # ---------------------------------------------------------
    expected_amount = int(total * 100)

    razorpay_amount = int(razorpay_payment.get("amount", 0))

    if razorpay_amount != expected_amount:

        raise HTTPException(
            status_code=400,
            detail="Payment amount does not match order amount",
        )

    # ---------------------------------------------------------
    # Also verify Razorpay Order amount
    # ---------------------------------------------------------
    if int(razorpay_order.get("amount", 0)) != expected_amount:

        raise HTTPException(
            status_code=400,
            detail="Razorpay order amount does not match",
        )

    # ---------------------------------------------------------
    # 10. Create order + reduce VARIANT stock
    # ---------------------------------------------------------
    with transaction.atomic():

        locked_items = []

        # -----------------------------------------------------
        # Lock selected variants
        # -----------------------------------------------------
        for item_data in ready_items:

            product = item_data["product"]
            variant = item_data["variant"]
            quantity = item_data["quantity"]
            line_total = item_data["line_total"]

            locked_variant = ProductVariant.objects.select_for_update().get(
                id=variant.id,
                product_id=product.id,
                is_active=True,
            )

            # -------------------------------------------------
            # Re-check stock after locking
            # -------------------------------------------------
            if locked_variant.stock < quantity:

                raise HTTPException(
                    status_code=409,
                    detail=(
                        f"Only {locked_variant.stock} available "
                        f"for {product.name} - "
                        f"{locked_variant.unit}"
                    ),
                )

            locked_items.append(
                {
                    "product": product,
                    "variant": locked_variant,
                    "quantity": quantity,
                    "line_total": line_total,
                }
            )

        # -----------------------------------------------------
        # Create Order
        # -----------------------------------------------------
        order = Order.objects.create(
            user=current_user,
            order_number="JH" + uuid4().hex[:10].upper(),
            customer_name=data.customer_name,
            phone=data.phone,
            email=data.email,
            address=data.address,
            pincode=data.pincode,
            payment_method="online",
            payment_status="paid",
            status="confirmed",
            subtotal=subtotal,
            delivery_fee=delivery_fee,
            total=total,
            razorpay_order_id=data.razorpay_order_id,
            razorpay_payment_id=data.razorpay_payment_id,
            razorpay_signature=data.razorpay_signature,
        )

        # -----------------------------------------------------
        # Create Order Items
        # + Reduce selected VARIANT stock
        # -----------------------------------------------------
        for item_data in locked_items:

            product = item_data["product"]
            variant = item_data["variant"]
            quantity = item_data["quantity"]
            line_total = item_data["line_total"]

            # -------------------------------------------------
            # Create order item
            # -------------------------------------------------
            OrderItem.objects.create(
                order=order,
                product=product,
                variant=variant,
                product_name=product.name,
                quantity=quantity,
                # IMPORTANT:
                # Selected variant price
                unit_price=variant.price,
                line_total=line_total,
            )

            # -------------------------------------------------
            # Reduce ONLY selected variant stock
            # -------------------------------------------------
            variant.stock -= quantity

            variant.save(
                update_fields=[
                    "stock",
                    "updated_at",
                ]
            )

            # -------------------------------------------------
            # Sync Product total stock
            #
            # Product.stock represents the total stock
            # across all active variants.
            # -------------------------------------------------
            total_product_stock = (
                ProductVariant.objects.filter(
                    product=product,
                    is_active=True,
                )
                .aggregate(total=Sum("stock"))
                .get("total")
                or 0
            )

            product.stock = total_product_stock

            product.save(
                update_fields=[
                    "stock",
                    "updated_at",
                ]
            )

    # ---------------------------------------------------------
    # 11. Final response
    # ---------------------------------------------------------
    return {
        "success": True,
        "message": "Payment verified and order created successfully",
        "order_number": order.order_number,
        "payment_id": order.razorpay_payment_id,
        "subtotal": float(subtotal),
        "delivery_fee": float(delivery_fee),
        "total": float(total),
        "payment_status": order.payment_status,
        "status": order.status,
    }


@app.get("/api/admin/reviews")
def admin_reviews(
    admin=Depends(admin_required),
):
    reviews = ProductReview.objects.select_related("product", "user", "order").order_by(
        "-created_at"
    )

    return [
        {
            "id": review.id,
            "product_id": review.product_id,
            "product_name": review.product.name,
            "user_id": review.user_id,
            "user_name": (review.user.get_full_name() or review.user.username),
            "order_number": review.order.order_number,
            "rating": review.rating,
            "review": review.review,
            "is_approved": review.is_approved,
            "created_at": review.created_at.isoformat(),
        }
        for review in reviews
    ]


@app.get("/api/admin/orders")
def admin_orders(
    admin=Depends(admin_required),
):
    orders = (
        Order.objects.prefetch_related("items")
        .select_related("user")
        .order_by("-created_at")
    )

    result = []

    for o in orders:
        result.append(
            {
                "order_number": o.order_number,
                "customer": {
                    "id": o.user.id if o.user else None,
                    "name": o.customer_name,
                    "email": o.email,
                    "phone": o.phone,
                },
                "address": o.address,
                "pincode": o.pincode,
                "payment_method": o.payment_method,
                "payment_status": o.payment_status,
                "status": o.status,
                "subtotal": float(o.subtotal),
                "delivery_fee": float(o.delivery_fee),
                "total": float(o.total),
                "created_at": o.created_at.isoformat(),
                "items": [
                    {
                        "product_id": item.product_id,
                        "product_name": item.product_name,
                        "variant_id": item.variant_id if item.variant else None,
                        "pack_size": item.variant.unit if item.variant else None,
                        "quantity": item.quantity,
                        "unit_price": float(item.unit_price),
                        "line_total": float(item.line_total),
                    }
                    for item in o.items.all()
                ],
            }
        )

    return result


@app.put("/api/admin/orders/{order_number}/status")
async def update_order_status(
    order_number: str,
    status_data: dict,
    admin=Depends(admin_required),
):

    new_status = status_data.get("status")

    allowed_statuses = [
        "pending",
        "confirmed",
        "packed",
        "shipped",
        "delivered",
        "cancelled",
    ]

    if new_status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail="Invalid order status",
        )

    # -----------------------------------------
    # GET ORDER
    # -----------------------------------------

    try:
        order = await sync_to_async(Order.objects.get)(order_number=order_number)

    except Order.DoesNotExist:

        raise HTTPException(
            status_code=404,
            detail="Order not found",
        )

    # -----------------------------------------
    # UPDATE DATABASE
    # -----------------------------------------

    order.status = new_status

    await sync_to_async(order.save)(
        update_fields=[
            "status",
            "updated_at",
        ]
    )

    print(f"ORDER STATUS CHANGED: " f"{order.order_number} -> {order.status}")

    # -----------------------------------------
    # REALTIME BROADCAST
    # -----------------------------------------

    await manager.broadcast(
        {
            "type": "order_status_updated",
            "order_number": order.order_number,
            "status": order.status,
        }
    )

    print(
        f"ORDER STATUS BROADCAST COMPLETED: " f"{order.order_number} -> {order.status}"
    )

    return {
        "success": True,
        "message": "Order status updated successfully",
        "order_number": order.order_number,
        "status": order.status,
    }


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):

    await manager.connect(websocket)

    try:
        await websocket.send_json({"type": "connected"})

        while True:
            await websocket.receive_text()

    except WebSocketDisconnect:

        manager.disconnect(websocket)

    except Exception as e:

        print("WebSocket connection error:", str(e))

        manager.disconnect(websocket)


@app.post("/api/chat")
def chat(d: Chat):
    key = os.getenv("OPENAI_API_KEY", "").strip()
    if not key:
        return {
            "answer": "AI chat is not configured yet. Please contact Jeeva Herbs on WhatsApp.",
            "configured": False,
        }
    ps = "\n".join(
        f"- {p.name}: "
        f'{", ".join(f"{v.unit}=₹{v.price} (stock={v.stock})" for v in p.variants.all() if v.is_active)}; '
        f'ingredients={", ".join(p.ingredients)}; '
        f"{p.description}"
        for p in Product.objects.filter(is_active=True).prefetch_related("variants")
    )
    fs = "\n".join(
        f"- {f.question}: {f.answer}" for f in FAQ.objects.filter(active=True)
    )
    system = f"""You are Jeeva, the Jeeva Herbs customer-support assistant. Answer only about products, ordering, ingredients, preparation, delivery, payments and approved FAQs. Reply in the customer language (English, Tamil or Tanglish). Never diagnose, prescribe or claim a food treats/cures a disease. For pregnancy, children, allergies, medication interactions or health conditions, recommend a qualified doctor. Never invent prices, stock, ingredients, nutrition, certification or delivery promises.\nPRODUCTS:\n{ps}\nFAQ:\n{fs}"""
    c = OpenAI(api_key=key)
    msgs = (
        [{"role": "system", "content": system}]
        + [x for x in d.history[-10:] if x.get("role") in ("user", "assistant")]
        + [{"role": "user", "content": d.message}]
    )
    r = c.responses.create(
        model=os.getenv("OPENAI_MODEL", "gpt-5.6-luna"),
        input=msgs,
        max_output_tokens=500,
    )
    return {"answer": r.output_text, "configured": True}

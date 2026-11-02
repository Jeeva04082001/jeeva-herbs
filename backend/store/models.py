from django.db import models
from django.utils.text import slugify
from decimal import Decimal
from django.contrib.auth.models import User
import uuid


class Product(models.Model):
    name = models.CharField(max_length=160)
    slug = models.SlugField(unique=True, blank=True)
    tag = models.CharField(max_length=80, blank=True)
    category = models.CharField(max_length=30, default="soup")
    description = models.TextField()
    ingredients = models.JSONField(default=list)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=40, default="200g")
    stock = models.PositiveIntegerField(default=0)
    image_url = models.URLField(blank=True)
    hover_image_url = models.CharField(max_length=500, blank=True)
    is_active = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *a, **k):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*a, **k)

    def __str__(self):
        return self.name

    class Meta:
        db_table = "Product"


class ProductVariant(models.Model):
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="variants"
    )

    unit = models.CharField(max_length=40)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.product.name} - {self.unit}"

    class Meta:
        db_table = "ProductVariant"
        ordering = ["price"]
        constraints = [
            models.UniqueConstraint(
                fields=["product", "unit"], name="unique_product_variant_unit"
            )
        ]


class FAQ(models.Model):
    question = models.CharField(max_length=300)
    answer = models.TextField()
    active = models.BooleanField(default=True)
    priority = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.question

    class Meta:
        db_table = "FAQ"


class Order(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="orders",
    )

    STATUSES = [
        ("pending", "Pending"),
        ("confirmed", "Confirmed"),
        ("packed", "Packed"),
        ("shipped", "Shipped"),
        ("delivered", "Delivered"),
        ("cancelled", "Cancelled"),
    ]
    order_number = models.CharField(max_length=24, unique=True)
    customer_name = models.CharField(max_length=120)
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True)
    address = models.TextField()
    pincode = models.CharField(max_length=10)
    payment_method = models.CharField(max_length=20, default="cod")
    payment_status = models.CharField(max_length=20, default="pending")
    razorpay_order_id = models.CharField(max_length=100, blank=True, null=True)
    razorpay_payment_id = models.CharField(max_length=100, blank=True, null=True)
    razorpay_signature = models.CharField(max_length=255, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUSES, default="pending")
    subtotal = models.DecimalField(
        max_digits=10, decimal_places=2, default=Decimal("0")
    )
    delivery_fee = models.DecimalField(
        max_digits=10, decimal_places=2, default=Decimal("0")
    )
    total = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0"))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.order_number

    class Meta:
        db_table = "Order"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name="items", on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    product_name = models.CharField(max_length=160)
    variant = models.ForeignKey(
        ProductVariant,
        on_delete=models.PROTECT,
        related_name="order_items",
        null=True,
        blank=True,
    )
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    line_total = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = "Order_Item"


class ProductReview(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="reviews",
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="product_reviews",
    )

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="reviews",
    )

    rating = models.PositiveSmallIntegerField()
    review = models.TextField(blank=True)

    is_approved = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "ProductReview"
        ordering = ["-created_at"]

        constraints = [
            models.UniqueConstraint(
                fields=["product", "user", "order"],
                name="unique_product_review_per_order",
            )
        ]

    def __str__(self):
        return f"{self.product.name} - {self.rating}★ - {self.user.username}"


class CustomerType(models.Model):
    name = models.CharField(max_length=50, unique=True)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        db_table = "CustomerType"
        ordering = ["name"]


class Supermarket(models.Model):
    name = models.CharField(max_length=160, unique=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    pincode = models.CharField(max_length=10, blank=True)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        db_table = "Supermarket"
        ordering = ["name"]


class Customer(models.Model):

    user = models.OneToOneField(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="store_customer",
    )

    full_name = models.CharField(max_length=120)
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True)

    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    pincode = models.CharField(max_length=10, blank=True)

    customer_type = models.ForeignKey(
        CustomerType,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="customers",
    )

    supermarket = models.ForeignKey(
        Supermarket,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="customers",
    )

    notes = models.TextField(blank=True)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.full_name} - {self.phone}"

    class Meta:
        db_table = "Customer"
        ordering = ["-created_at"]


    
class CustomerPurchase(models.Model):
    customer = models.ForeignKey(
        Customer,
        on_delete=models.CASCADE,
        related_name="purchases",
    )
    
    purchase_group_id = models.UUIDField(
        null=True,
        blank=True,
        db_index=True,
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
        related_name="customer_purchases",
    )

    variant = models.ForeignKey(
        ProductVariant,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="customer_purchases",
    )

    purchase_date = models.DateField()

    quantity = models.PositiveIntegerField(default=1)

    unit_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.customer.full_name} - {self.product.name}"

    class Meta:
        db_table = "CustomerPurchase"
        ordering = ["-purchase_date", "-created_at"]


class CourierService(models.Model):
    courier_name = models.CharField(
        max_length=120,
        unique=True
    )
    tracking_url_template = models.URLField(
        blank=True
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["courier_name"]

    def __str__(self):
        return self.courier_name
    
   

class CustomerPurchaseTracking(models.Model):
    purchase_group_id = models.UUIDField(
        unique=True,
        db_index=True
    )

    courier = models.ForeignKey(
        CourierService,
        on_delete=models.PROTECT,
        related_name="shipments"
    )

    tracking_number = models.CharField(
        max_length=120
    )

    tracking_url = models.URLField(
        blank=True
    )

    dispatch_date = models.DateField(
        null=True,
        blank=True
    )

    shipment_status = models.CharField(
        max_length=30,
        default="Pending"
    )

    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )



class SupportTicket(models.Model):

    CATEGORY_CHOICES = [
        ("product", "Product Inquiry"),
        ("delivery", "Delivery Issue"),
        ("payment", "Payment Issue"),
        ("quality", "Product Quality"),
        ("order", "Order Issue"),
        ("other", "Other"),
    ]

    PRIORITY_CHOICES = [
        ("low", "Low"),
        ("medium", "Medium"),
        ("high", "High"),
        ("urgent", "Urgent"),
    ]

    STATUS_CHOICES = [
        ("open", "Open"),
        ("in_progress", "In Progress"),
        ("escalated", "Escalated"),
        ("resolved", "Resolved"),
        ("closed", "Closed"),
    ]

    ticket_number = models.CharField(
        max_length=24,
        unique=True,
        editable=False,
    )

    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="support_tickets",
    )

    order = models.ForeignKey(
        "store.Order",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="support_tickets",
    )

    subject = models.CharField(max_length=200)
    description = models.TextField()

    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        default="other",
    )

    priority = models.CharField(
        max_length=10,
        choices=PRIORITY_CHOICES,
        default="medium",
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="open",
    )

    ai_suggested_reply = models.TextField(blank=True)
    admin_reply = models.TextField(blank=True)
    resolution = models.TextField(blank=True)

    escalated_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.ticket_number:
            self.ticket_number = (
                f"JH-{uuid.uuid4().hex[:12].upper()}"
            )
        super().save(*args, **kwargs)

    def __str__(self):
        return self.ticket_number

    class Meta:
        db_table = "SupportTicket"
        ordering = ["-created_at"]



class SupportConversation(models.Model):
    conversation_id = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
        editable=False,
    )
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="support_conversations",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "SupportConversation"
        ordering = ["-updated_at"]

    def __str__(self):
        return str(self.conversation_id)


class SupportMessage(models.Model):
    ROLE_CHOICES = [
        ("user", "User"),
        ("assistant", "Assistant"),
    ]

    conversation = models.ForeignKey(
        SupportConversation,
        on_delete=models.CASCADE,
        related_name="messages",
    )
    role = models.CharField(
        max_length=10,
        choices=ROLE_CHOICES,
    )
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "SupportMessage"
        ordering = ["created_at"]
        indexes = [
            models.Index(
                fields=["conversation", "created_at"],
            ),
        ]

    def __str__(self):
        return f"{self.role}: {self.content[:50]}"







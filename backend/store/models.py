from django.db import models
from django.utils.text import slugify
from decimal import Decimal
from django.contrib.auth.models import User

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
        Product,
        on_delete=models.CASCADE,
        related_name="variants"
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
                fields=["product", "unit"],
                name="unique_product_variant_unit"
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
    razorpay_order_id = models.CharField(max_length=100, blank=True,null=True ) 
    razorpay_payment_id=models.CharField(max_length=100,blank=True,null=True) 
    razorpay_signature = models.CharField(max_length=255, blank=True,null=True)
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
    variant = models.ForeignKey(ProductVariant, on_delete=models.PROTECT,related_name="order_items",null=True,blank=True)
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
        
        
        
        
        
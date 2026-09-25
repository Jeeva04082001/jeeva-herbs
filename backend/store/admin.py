from django.contrib import admin
from .models import Product,FAQ,Order,OrderItem
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
 list_display=('name','price','stock','is_active','updated_at');list_editable=('price','stock','is_active');search_fields=('name','description')
@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):list_display=('question','active','priority');list_editable=('active','priority')
class ItemInline(admin.TabularInline):model=OrderItem;extra=0;readonly_fields=('product','product_name','quantity','unit_price','line_total')
@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
 list_display=('order_number','customer_name','phone','total','payment_status','status','created_at');list_filter=('status','payment_status');list_editable=('status',);inlines=[ItemInline]

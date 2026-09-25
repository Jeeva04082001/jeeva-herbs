import os,json,redis
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Product,Order
def pub(x):
 try:redis.from_url(os.getenv('REDIS_URL','redis://localhost:6379/0'),decode_responses=True).publish('jeeva_events',json.dumps(x))
 except Exception:pass
@receiver(post_save,sender=Product)
def product(sender,instance,**kw):pub({'type':'product.updated','product_id':instance.id,'stock':instance.stock,'price':str(instance.price),'is_active':instance.is_active})
@receiver(post_save,sender=Order)
def order(sender,instance,**kw):pub({'type':'order.updated','order_number':instance.order_number,'status':instance.status,'payment_status':instance.payment_status})

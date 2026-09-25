from django.core.management.base import BaseCommand
from store.models import Product,FAQ
P=[('Murungai Keerai Soup','Immunity','Drumstick leaf soup for everyday wellness.',['Murungai Keerai','Curry Leaves','Garlic','Pepper'],149),('Karuveppilai Soup','Iron & Blood','Traditional curry-leaf soup.',['Karuveppilai','Green Gram','Garlic','Pepper'],149),('Modakathan Soup','Joint Care','Traditional herbal soup.',['Modakathan','Roasted Gram','Pepper'],159),('Thoothuvalai Soup','Cold & Cough','Traditional seasonal herbal soup.',['Thoothuvalai','Garlic','Pepper'],159),('Idly Podi','Everyday','Spice blend for idli, dosa and rice.',['Murungai','Karuveppilai','Sesame'],129),('Murungai Keerai Laddu','Healthy Snack','Moringa-leaf ladoo.',['Murungai Keerai','Jaggery','Ghee'],179)]
F=[('How do I prepare Jeeva soup premix?','Boil 2 cups of water, add 2 spoons of premix, simmer 5–10 minutes and serve hot.'),('What is the shelf life?','The current website says 6 months from packing when stored in a cool, dry place. Confirm the batch label.'),('Do you deliver across Tamil Nadu?','The current website says Tamil Nadu delivery and selected pan-India locations. Confirm the pincode.'),('Is it suitable for kids?','For toddlers or health concerns, consult a paediatrician.'),('Can diabetics consume it?','Check ingredients and nutrition with a doctor before adding it to a diabetes-management diet.')]
class Command(BaseCommand):
 def handle(self,*a,**k):
  for n,t,d,i,p in P:Product.objects.update_or_create(name=n,defaults={'tag':t,'description':d,'ingredients':i,'price':p,'stock':20,'is_active':True})
  for q,a in F:FAQ.objects.update_or_create(question=q,defaults={'answer':a,'active':True})
  self.stdout.write(self.style.SUCCESS('Seeded.'))

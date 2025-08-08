# from mongoengine import connect, Document, StringField

# connect(
#     host="mongodb+srv://mlnarayana576:XyPMIGcISoigRbUZ@luckycluster1.pbnhmyq.mongodb.net/StockSightDb1?retryWrites=true&w=majority"
# )

# class User(Document):
#     email = StringField(required=True, unique=True)
#     hashed_password = StringField(required=True)
#     name = StringField()
#     meta = {'collection': 'Collection1'}

# user = User(email="test@now.com", hashed_password="abc", name="Test").save()
# print("User created:", user.id)

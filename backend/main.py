from datetime import datetime, UTC
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from config import Config
from models import PaymentMethod, PaymentStatus, db, User, Product, Order, Admin, Cart, Payment

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)
jwt = JWTManager(app)
db.init_app(app)

# with app.app_context():
#     db.create_all()

# Routes d'authentification
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email déjà utilisé'}), 400
        
    hashed_password = generate_password_hash(data['password'])
    
    new_user = User(
        email=data['email'],
        password=hashed_password,
        user_type=data['user_type'],
        name=data['name'],
        phone=data.get('phone'),
        address=data.get('address')
    )
    
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({'message': 'Utilisateur créé avec succès'}), 200

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    
    if user and check_password_hash(user.password, data['password']):
        access_token = create_access_token(identity=str(user.id), expires_delta=timedelta(hours=2))
        return jsonify({
            'token': access_token,
            'user_type': user.user_type,
            'user_id': user.id
        })
        
    return jsonify({'error': 'Email ou mot de passe incorrect'}), 401

#to test the user
@app.route('/api/check-auth', methods=['GET'])
@jwt_required()
def check_auth():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({
        'id': user.id,
        'email': user.email,
        'name': user.name,
        'user_type': user.user_type,
        'address': user.address
    })

@app.route('/api/products/<int:product_id>', methods=['PUT'])
@jwt_required()
def update_product(product_id):
    current_user_id = get_jwt_identity()
    # print(current_user_id)
    product = Product.query.get_or_404(product_id)
    # print(product.seller_id)
    if int(product.seller_id) != int(current_user_id):
        return jsonify({'error': 'Non autorisé'}), 403
        
    data = request.get_json()
    
    for key, value in data.items():
        setattr(product, key, value)
    
    db.session.commit()
    return jsonify({'message': 'Produit mis à jour avec succès'})

@app.route('/api/products/<int:product_id>', methods=['DELETE'])
@jwt_required()
def delete_product(product_id):
    current_user_id = get_jwt_identity()
    product = Product.query.get_or_404(product_id)
    
    if product.seller_id != int(current_user_id):
        return jsonify({'error': 'Non autorisé'}), 403
        
    db.session.delete(product)
    db.session.commit()
    return jsonify({'message': 'Produit supprimé avec succès'})

# Routes des commandes
@app.route('/api/orders', methods=['GET'])
@jwt_required()
def get_orders():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if user.user_type == 'farmer':
        # Les agriculteurs voient les commandes de leurs produits
        orders = Order.query.join(Product).filter(Product.seller_id == current_user_id).all()
    else:
        # Les clients et commerçants voient leurs propres commandes
        orders = Order.query.filter_by(buyer_id=current_user_id).all()
    
    return jsonify([{
        'id': o.id,
        'product_id': o.product_id,
        'quantity': o.quantity,
        'total_price': o.total_price,
        'peeling_requested': o.peeling_requested,
        'status': o.status,
        'delivery_address': o.delivery_address,
        'created_at': o.created_at.isoformat()
    } for o in orders])

@app.route('/api/orders', methods=['POST'])
@jwt_required()
def create_order():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    product = Product.query.get_or_404(data['product_id'])
    
    if product.quantity < data['quantity']:
        return jsonify({'error': 'Quantité insuffisante'}), 400
        
    total_price = product.price * data['quantity']
    if data.get('peeling_requested') and product.peeling_available:
        total_price += product.peeling_price * data['quantity']
    
    new_order = Order(
        buyer_id=current_user_id,
        product_id=data['product_id'],
        quantity=data['quantity'],
        total_price=total_price,
        peeling_requested=data.get('peeling_requested', False),
        delivery_address=data['delivery_address']
    )
    
    # Mettre à jour la quantité du produit
    product.quantity -= data['quantity']
    
    db.session.add(new_order)
    db.session.commit()
    
    return jsonify({'message': 'Commande créée avec succès'}), 201


###################################################################
#  CART APIS
###################################################################
@app.route('/api/cart', methods=['GET'])
@jwt_required()
def get_cart():
    current_user_id = get_jwt_identity()
    cart_items = Cart.query.filter_by(user_id=current_user_id).all()
    
    return jsonify([{
        'id': item.id,
        'product_id': item.product_id,
        'product_name': item.product.name,
        'quantity': item.quantity,
        'price_per_unit': item.product.price,
        'total_price': item.total_price,
        'seller_name': item.product.seller.name,
        'created_at': item.created_at.isoformat()
    } for item in cart_items])

@app.route('/api/cart/add', methods=['POST'])
@jwt_required()
def add_to_cart():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    # Verify product exists and has enough quantity
    product = Product.query.get_or_404(data['product_id'])
    if product.quantity < data['quantity']:
        return jsonify({'error': 'Quantité insuffisante en stock'}), 400
    
    # Check if product already in cart
    existing_item = Cart.query.filter_by(
        user_id=current_user_id,
        product_id=data['product_id']
    ).first()
    
    if existing_item:
        # Update quantity if product already in cart
        new_quantity = existing_item.quantity + data['quantity']
        if product.quantity < new_quantity:
            return jsonify({'error': 'Quantité insuffisante en stock'}), 400
            
        existing_item.quantity = new_quantity
        existing_item.update_total_price()
    else:
        # Create new cart item
        cart_item = Cart(
            user_id=current_user_id,
            product_id=data['product_id'],
            quantity=data['quantity'],
            total_price=product.price * data['quantity']
        )
        db.session.add(cart_item)
    
    # Update product quantity
    product.quantity -= data['quantity']
    db.session.commit()
    
    return jsonify({'message': 'Produit ajouté au panier'}), 201

@app.route('/api/cart/<int:cart_item_id>', methods=['PUT'])
@jwt_required()
def update_cart_item(cart_item_id):
    current_user_id = get_jwt_identity()
    cart_item = Cart.query.get_or_404(cart_item_id)
    
    if int(cart_item.user_id) != int(current_user_id):
        return jsonify({'error': 'Non autorisé'}), 403
    
    data = request.get_json()
    product = Product.query.get(cart_item.product_id)
    
    if 'quantity' in data:
        quantity_diff = data['quantity'] - cart_item.quantity
        if product.quantity < quantity_diff:
            return jsonify({'error': 'Stock insuffisant'}), 400
        
        # Update product quantity
        product.quantity -= quantity_diff
        cart_item.quantity = data['quantity']
        cart_item.update_total_price()
    
    db.session.commit()
    return jsonify({'message': 'Panier mis à jour'})

@app.route('/api/cart/<int:cart_item_id>', methods=['DELETE'])
@jwt_required()
def remove_from_cart(cart_item_id):
    current_user_id = get_jwt_identity()
    cart_item = Cart.query.get_or_404(cart_item_id)
    
    if int(cart_item.user_id) != int(current_user_id):
        return jsonify({'error': 'Non autorisé'}), 403
    
    # Return the quantity to the product
    product = Product.query.get(cart_item.product_id)
    if product:
        product.quantity += cart_item.quantity
    
    db.session.delete(cart_item)
    db.session.commit()
    
    return jsonify({'message': 'Article supprimé du panier'})

@app.route('/api/cart/checkout', methods=['POST'])
@jwt_required()
def checkout():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    cart_items = Cart.query.filter_by(user_id=current_user_id).all()
    
    if not cart_items:
        return jsonify({'error': 'Panier vide'}), 400
    
    try:
        # Create orders from cart items
        for cart_item in cart_items:
            order = Order(
                buyer_id=current_user_id,
                product_id=cart_item.product_id,
                quantity=cart_item.quantity,
                total_price=cart_item.total_price,
                delivery_address=data['delivery_address']
            )
            db.session.add(order)
            db.session.delete(cart_item)
        
        db.session.commit()
        return jsonify({'message': 'Commande créée avec succès'}), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Erreur lors de la création de la commande'}), 500
    
from datetime import datetime, timedelta

@app.route('/api/payment/process', methods=['POST'])
@jwt_required()
def process_payment():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validate payment method
    try:
        payment_method = PaymentMethod(data['payment_method'])
    except ValueError:
        return jsonify({'error': 'Méthode de paiement non valide'}), 400
    
    # Get cart items
    cart_items = Cart.query.filter_by(user_id=current_user_id).all()
    if not cart_items:
        return jsonify({'error': 'Panier vide'}), 400
    
    # Calculate total amount
    total_amount = sum(item.total_price for item in cart_items)
    
    # Create payment record
    payment = Payment(
        user_id=current_user_id,
        amount=total_amount,
        payment_method=payment_method.value
    )
    
    try:
        # Process payment based on method
        if payment_method == PaymentMethod.CREDIT_CARD:
            result = process_credit_card_payment(data, total_amount)
        elif payment_method == PaymentMethod.PAYPAL:
            result = process_paypal_payment(data, total_amount)
        elif payment_method == PaymentMethod.CASH_ON_DELIVERY:
            result = process_cash_on_delivery(data, total_amount)
            
        if not result['success']:
            return jsonify({'error': result['message']}), 400
            
        payment.transaction_id = result.get('transaction_id')
        payment.payment_status = (PaymentStatus.AWAITING_DELIVERY.value 
                                if payment_method == PaymentMethod.CASH_ON_DELIVERY 
                                else PaymentStatus.COMPLETED.value)
        
        # Move cart items to orders
        orders = create_orders_from_cart(cart_items, data['delivery_address'], payment)
        
        db.session.add(payment)
        db.session.commit()
        
        return jsonify({
            'message': 'Paiement traité avec succès',
            'payment_id': payment.id,
            'transaction_id': payment.transaction_id,
            'order_ids': [order.id for order in orders]
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

def process_credit_card_payment(data, amount):
    """Process credit card payment (mock implementation)"""
    required_fields = ['card_number', 'expiry_month', 'expiry_year', 'cvv']
    
    if not all(field in data for field in required_fields):
        return {
            'success': False,
            'message': 'Informations de carte manquantes'
        }
    
    # Here you would integrate with your actual payment processor
    # This is a mock implementation
    return {
        'success': True,
        'transaction_id': f'CC-{datetime.now(UTC).strftime("%Y%m%d%H%M%S")}'
    }

def process_paypal_payment(data, amount):
    """Process PayPal payment (mock implementation)"""
    if 'paypal_token' not in data:
        return {
            'success': False,
            'message': 'Token PayPal manquant'
        }
    
    # Here you would integrate with PayPal's API
    # This is a mock implementation
    return {
        'success': True,
        'transaction_id': f'PP-{datetime.now(UTC).strftime("%Y%m%d%H%M%S")}'
    }

def process_cash_on_delivery(data, amount):
    """Process cash on delivery request"""
    # Validate delivery address
    if 'delivery_address' not in data:
        return {
            'success': False,
            'message': 'Adresse de livraison manquante'
        }
    
    # Generate a COD reference number
    return {
        'success': True,
        'transaction_id': f'COD-{datetime.now(UTC).strftime("%Y%m%d%H%M%S")}'
    }

def create_orders_from_cart(cart_items, delivery_address, payment):
    """Convert cart items to orders after successful payment"""
    orders = []
    
    for cart_item in cart_items:
        order = Order(
            buyer_id=cart_item.user_id,
            product_id=cart_item.product_id,
            quantity=cart_item.quantity,
            total_price=cart_item.total_price,
            delivery_address=delivery_address,
            status='pending' if payment.payment_status == PaymentStatus.COMPLETED.value else 'awaiting_payment'
        )
        db.session.add(order)
        db.session.delete(cart_item)
        orders.append(order)
    
    return orders

@app.route('/api/payment/<int:payment_id>/status', methods=['GET'])
@jwt_required()
def get_payment_status(payment_id):
    current_user_id = get_jwt_identity()
    payment = Payment.query.get_or_404(payment_id)
    
    if int(payment.user_id) != int(current_user_id):
        return jsonify({'error': 'Non autorisé'}), 403
    
    return jsonify({
        'payment_id': payment.id,
        'status': payment.payment_status,
        'method': payment.payment_method,
        'amount': payment.amount,
        'transaction_id': payment.transaction_id,
        'created_at': payment.created_at.isoformat()
    })

@app.route('/api/payment/confirm-delivery/<int:payment_id>', methods=['POST'])
@jwt_required()
def confirm_delivery_payment(payment_id):
    current_user_id = get_jwt_identity()
    payment = Payment.query.get_or_404(payment_id)
    
    if payment.payment_method != PaymentMethod.CASH_ON_DELIVERY.value:
        return jsonify({'error': 'Méthode de paiement non valide'}), 400
    
    if payment.payment_status != PaymentStatus.AWAITING_DELIVERY.value:
        return jsonify({'error': 'Statut de paiement non valide'}), 400
    
    # Update payment status
    payment.payment_status = PaymentStatus.COMPLETED.value
    
    # Update related orders
    orders = Order.query.filter_by(buyer_id=current_user_id).all()
    for order in orders:
        if order.status == 'awaiting_payment':
            order.status = 'pending'
    
    db.session.commit()
    
    return jsonify({'message': 'Paiement à la livraison confirmé'})

import base64
from io import BytesIO
from PIL import Image

def compress_image(image_data, max_size_kb=500):
    """Compress image to a maximum size"""
    img = Image.open(BytesIO(image_data))
    
    # Initialize quality
    quality = 95
    output = BytesIO()
    
    # Compress until size is under max_size_kb
    while quality > 5:
        output = BytesIO()
        img.save(output, format='JPEG', quality=quality)
        if len(output.getvalue()) <= max_size_kb * 1024:
            break
        quality -= 5
        
    return output.getvalue()

@app.route('/api/products', methods=['POST'])
@jwt_required()
def create_product():
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    
    if user.user_type != 'farmer':
        return jsonify({'error': 'Non autorisé'}), 403
        
    # Handle multipart form data
    if 'product_image' not in request.files:
        return jsonify({'error': 'Image du produit requise'}), 400
        
    file = request.files['product_image']
    if file.filename == '':
        return jsonify({'error': 'Aucun fichier sélectionné'}), 400
        
    if not file.content_type.startswith('image/'):
        return jsonify({'error': 'Le fichier doit être une image'}), 400
    
    # Read and compress image
    image_data = compress_image(file.read())
    
    # Get other product data
    data = request.form
    
    new_product = Product(
        name=data['name'],
        description=data.get('description'),
        price=float(data['price']),
        quantity=int(data['quantity']),
        unit=data['unit'],
        seller_id=current_user_id,
        peeling_available=data.get('peeling_available', 'false').lower() == 'true',
        peeling_price=float(data.get('peeling_price', 0)),
        product_image=image_data,
        validated_by_admin=False,
        image_url=data.get('image_url')
    )
    
    db.session.add(new_product)
    db.session.commit()
    
    return jsonify({'message': 'Produit créé avec succès, en attente de validation'}), 201

@app.route('/api/admin/products/<int:product_id>/validate', methods=['POST'])
@jwt_required()
def validate_product(product_id):
    if not is_admin():
        return jsonify({'error': 'Accès non autorisé'}), 403
    
    product = Product.query.get_or_404(product_id)
    
    if product.validated_by_admin:
        return jsonify({'error': 'Produit déjà validé'}), 400
    
    product.validated_by_admin = True
    product.validation_date = datetime.now(UTC)
    db.session.commit()
    
    # Notify seller that their product has been validated
    # (You could implement notification system here)
    
    return jsonify({
        'message': 'Produit validé avec succès',
        'product_id': product.id,
        'validation_date': product.validation_date.isoformat()
    })

# Modified get_products endpoint to only return validated products for regular users
@app.route('/api/farmer/products', methods=['GET'])
def get_farmer_products():
    try:
        # Verify JWT token and get farmer's ID
        verify_jwt_in_request()
        current_user_id = get_jwt_identity()
        
        # Get all products for the current farmer
        products = Product.query.filter_by(seller_id=current_user_id).all()
        
        return jsonify([{
            'id': p.id,
            'name': p.name,
            'description': p.description,
            'price': p.price,
            'quantity': p.quantity,
            'unit': p.unit,
            'seller_id': p.seller_id,
            'peeling_available': p.peeling_available,
            'peeling_price': p.peeling_price,
            'image_data': base64.b64encode(p.product_image).decode('utf-8') if p.product_image else None,
            'validated_by_admin': p.validated_by_admin,
            'validation_date': p.validation_date.isoformat() if p.validation_date else None
        } for p in products]), 200
        
    except Exception as e:
        return jsonify({'error': 'Authentication required or invalid token'}), 401

@app.route('/api/products', methods=['GET'])
def get_products():
    # Check if the request is from an admin
    is_admin_request = False
    
    query = Product.query
    if not is_admin_request:
        query = query.filter_by(validated_by_admin=True)
    
    products = query.all()
    return jsonify([{
        'id': p.id,
        'name': p.name,
        'description': p.description,
        'price': p.price,
        'quantity': p.quantity,
        'unit': p.unit,
        'seller_id': p.seller_id,
        'peeling_available': p.peeling_available,
        'peeling_price': p.peeling_price,
        'image_data': base64.b64encode(p.product_image).decode('utf-8') if p.product_image else None,
        'validated_by_admin': p.validated_by_admin,
        'validation_date': p.validation_date.isoformat() if p.validation_date else None
    } for p in products])


###################################################################
#  ADMIN APIS
###################################################################
@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    data = request.get_json()
    admin = Admin.query.filter_by(email=data['email']).first()
    
    if admin and check_password_hash(admin.password, data['password']):
        access_token = create_access_token(
            identity=str(admin.id), 
            additional_claims={'is_admin': True}, 
            expires_delta=timedelta(hours=2)  
        )

        return jsonify({
            'token': access_token,
            'user_id': admin.id,
            'user_type': 'admin'
        })
    
    return jsonify({'error': 'Email ou mot de passe incorrect'}), 401

from flask_jwt_extended import verify_jwt_in_request, get_jwt

def is_admin():
    verify_jwt_in_request()
    claims = get_jwt()
    return claims.get('is_admin', False)


@app.route('/api/admin/statistics', methods=['GET'])
@jwt_required()
def get_statistics():
    if not is_admin():
        return jsonify({'error': 'Accès non autorisé'}), 403
    
    # Statistiques des utilisateurs
    total_users = User.query.count()
    total_farmers = User.query.filter_by(user_type='farmer').count()
    total_merchants = User.query.filter_by(user_type='merchant').count()
    total_customers = User.query.filter_by(user_type='customer').count()
    
    # Statistiques des ventes
    total_orders = Order.query.count()
    total_sales = db.session.query(db.func.sum(Order.total_price)).scalar() or 0
    
    # Statistiques par statut de commande
    orders_by_status = db.session.query(
        Order.status, 
        db.func.count(Order.id)
    ).group_by(Order.status).all()
    
    # Statistiques mensuelles
    current_month = datetime.now(UTC).replace(day=1)
    monthly_sales = db.session.query(
        db.func.sum(Order.total_price)
    ).filter(Order.created_at >= current_month).scalar() or 0
    
    monthly_orders = Order.query.filter(
        Order.created_at >= current_month
    ).count()
    
    # Top vendeurs
    top_sellers = db.session.query(
        User.name,
        db.func.count(Order.id).label('total_orders'),
        db.func.sum(Order.total_price).label('total_sales')
    ).join(Product, Product.seller_id == User.id)\
     .join(Order, Order.product_id == Product.id)\
     .group_by(User.id)\
     .order_by(db.text('total_sales DESC'))\
     .limit(5)\
     .all()
    
    return jsonify({
        'users': {
            'total': total_users,
            'farmers': total_farmers,
            'merchants': total_merchants,
            'customers': total_customers
        },
        'sales': {
            'total_orders': total_orders,
            'total_revenue': total_sales,
            'orders_by_status': dict(orders_by_status),
            'monthly': {
                'revenue': monthly_sales,
                'orders': monthly_orders
            }
        },
        'top_sellers': [{
            'name': seller.name,
            'total_orders': seller.total_orders,
            'total_sales': float(seller.total_sales)
        } for seller in top_sellers]
    })

# Gestion des utilisateurs
@app.route('/api/admin/users', methods=['GET'])
@jwt_required()
def get_all_users():
    if not is_admin():
        return jsonify({'error': 'Accès non autorisé'}), 403
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    user_type = request.args.get('user_type')
    
    query = User.query
    if user_type:
        query = query.filter_by(user_type=user_type)
    
    users = query.paginate(page=page, per_page=per_page)
    
    return jsonify({
        'users': [{
            'id': u.id,
            'email': u.email,
            'name': u.name,
            'user_type': u.user_type,
            'phone': u.phone,
            'address': u.address,
            'created_at': u.created_at.isoformat(),
            'active': u.active if hasattr(u, 'active') else True
        } for u in users.items],
        'total_pages': users.pages,
        'current_page': page,
        'total_users': users.total
    })

@app.route('/api/admin/users/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user_details(user_id):
    if not is_admin():
        return jsonify({'error': 'Accès non autorisé'}), 403
    
    user = User.query.get_or_404(user_id)
    
    # Obtenir les statistiques de l'utilisateur
    if user.user_type == 'farmer':
        total_products = Product.query.filter_by(seller_id=user.id).count()
        total_sales = db.session.query(
            db.func.sum(Order.total_price)
        ).join(Product).filter(Product.seller_id == user.id).scalar() or 0
    else:
        total_orders = Order.query.filter_by(buyer_id=user.id).count()
        total_spent = db.session.query(
            db.func.sum(Order.total_price)
        ).filter_by(buyer_id=user.id).scalar() or 0
    
    user_data = {
        'id': user.id,
        'email': user.email,
        'name': user.name,
        'user_type': user.user_type,
        'phone': user.phone,
        'address': user.address,
        'created_at': user.created_at.isoformat(),
        'active': user.active if hasattr(user, 'active') else True
    }
    
    if user.user_type == 'farmer':
        user_data.update({
            'total_products': total_products,
            'total_sales': total_sales
        })
    else:
        user_data.update({
            'total_orders': total_orders,
            'total_spent': total_spent
        })
    
    return jsonify(user_data)

@app.route('/api/admin/users/<int:user_id>/status', methods=['PUT'])
@jwt_required()
def update_user_status(user_id):
    if not is_admin():
        return jsonify({'error': 'Accès non autorisé'}), 403
    
    user = User.query.get_or_404(user_id)
    data = request.get_json()
    print(type(data['active']))
    
    if 'active' in data:
        user.active = data['active']
        db.session.commit()
        status = 'activé' if data['active'] else 'désactivé'
        return jsonify({'message': f'Compte utilisateur {status} avec succès'})
    
    return jsonify({'error': 'Données invalides'}), 400

# Script pour créer un admin (à exécuter une fois)
def create_admin():
    with app.app_context():
        if not Admin.query.filter_by(email='admin@example.com').first():
            admin = Admin(
                email='admin@example.com',
                password=generate_password_hash('admin123'),
                name='Admin Principal'
            )
            db.session.add(admin)
            db.session.commit()
            print('Admin créé avec succès')

@app.route('/api/admin/products/pending', methods=['GET'])
@jwt_required()
def get_pending_products():
    if not is_admin():
        return jsonify({'error': 'Accès non autorisé'}), 403
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    products = Product.query.filter_by(validated_by_admin=False)\
        .paginate(page=page, per_page=per_page)
    
    return jsonify({
        'products': [{
            'id': p.id,
            'name': p.name,
            'description': p.description,
            'price': p.price,
            'quantity': p.quantity,
            'unit': p.unit,
            'seller_id': p.seller_id,
            'seller_name': p.seller.name,
            'peeling_available': p.peeling_available,
            'peeling_price': p.peeling_price,
            'image_data': base64.b64encode(p.product_image).decode('utf-8') if p.product_image else None,
            'created_at': p.created_at.isoformat()
        } for p in products.items],
        'total_pages': products.pages,
        'current_page': page,
        'total_products': products.total
    })


# print(app.url_map)

if __name__ == '__main__':
    app.run(debug=True)

# Routes des produits
# @app.route('/api/products', methods=['GET'])
# def get_products():
#     products = Product.query.all()
#     return jsonify([{
#         'id': p.id,
#         'name': p.name,
#         'description': p.description,
#         'price': p.price,
#         'quantity': p.quantity,
#         'unit': p.unit,
#         'seller_id': p.seller_id,
#         'peeling_available': p.peeling_available,
#         'peeling_price': p.peeling_price,
#         'image_url': p.image_url
#     } for p in products])

# @app.route('/api/products', methods=['POST'])
# @jwt_required()
# def create_product():
#     current_user_id = int(get_jwt_identity())
#     user = User.query.get(current_user_id)
#     # print(user.user_type)
#     if user.user_type != 'farmer':
#         return jsonify({'error': 'Non autorisé'}), 403
        
#     data = request.get_json()
    
#     new_product = Product(
#         name=data['name'],
#         description=data.get('description'),
#         price=data['price'],
#         quantity=data['quantity'],
#         unit=data['unit'],
#         seller_id=current_user_id,
#         peeling_available=data.get('peeling_available', False),
#         peeling_price=data.get('peeling_price'),
#         image_url=data.get('image_url')
#     )
    
#     db.session.add(new_product)
#     db.session.commit()
    
#     return jsonify({'message': 'Produit créé avec succès'}), 201




#sorry i had to test this 
# @app.route('/api/orders/<int:order_id>', methods=['DELETE'])
# @jwt_required()
# def remove_from_cart(order_id):
#     current_user_id = get_jwt_identity()
#     order = Order.query.get_or_404(order_id)
    
#     if int(order.buyer_id) != int(current_user_id):
#         return jsonify({'error': 'Non autorisé'}), 403
        
#     # Return the quantity to the product
#     product = Product.query.get(order.product_id)
#     if product:
#         product.quantity += order.quantity
    
#     db.session.delete(order)
#     db.session.commit()
    
#     return jsonify({'message': 'Article supprimé du panier'})

# @app.route('/api/orders/<int:order_id>', methods=['PUT'])
# @jwt_required()
# def update_order_item(order_id):
#     current_user_id = get_jwt_identity()
#     order = Order.query.get_or_404(order_id)
    
#     if int(order.buyer_id) != int(current_user_id):
#         return jsonify({'error': 'Non autorisé'}), 403
        
#     data = request.get_json()
#     product = Product.query.get(order.product_id)
    
#     if 'quantity' in data:
#         # Check if enough stock available
#         quantity_diff = data['quantity'] - order.quantity
#         if product.quantity < quantity_diff:
#             return jsonify({'error': 'Stock insuffisant'}), 400
            
#         # Update product quantity
#         product.quantity -= quantity_diff
#         order.quantity = data['quantity']
        
#     if 'peeling_requested' in data:
#         order.peeling_requested = data['peeling_requested']
    
#     # Recalculate total price
#     order.total_price = order.quantity * product.price
#     if order.peeling_requested:
#         order.total_price += order.quantity * product.peeling_price
    
#     db.session.commit()
#     return jsonify({'message': 'Panier mis à jour'})


# @app.route('/api/orders/<int:order_id>', methods=['PUT'])
# @jwt_required()
# def update_order_status(order_id):
#     current_user_id = get_jwt_identity()
#     user = User.query.get(current_user_id)
#     order = Order.query.get_or_404(order_id)
#     product = Product.query.get(order.product_id)
    
#     if user.user_type != 'farmer' or product.seller_id != current_user_id:
#         return jsonify({'error': 'Non autorisé'}), 403
        
#     data = request.get_json()
#     order.status = data['status']
#     db.session.commit()
    
#     return jsonify({'message': 'Statut de la commande mis à jour'})
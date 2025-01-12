from datetime import datetime, UTC
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from config import Config
from models import db, User, Product, Order, Admin

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)
jwt = JWTManager(app)
db.init_app(app)


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
        access_token = create_access_token(identity=str(user.id))
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
# Routes des produits
@app.route('/api/products', methods=['GET'])
def get_products():
    products = Product.query.all()
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
        'image_url': p.image_url
    } for p in products])

@app.route('/api/products', methods=['POST'])
@jwt_required()
def create_product():
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    # print(user.user_type)
    if user.user_type != 'farmer':
        return jsonify({'error': 'Non autorisé'}), 403
        
    data = request.get_json()
    
    new_product = Product(
        name=data['name'],
        description=data.get('description'),
        price=data['price'],
        quantity=data['quantity'],
        unit=data['unit'],
        seller_id=current_user_id,
        peeling_available=data.get('peeling_available', False),
        peeling_price=data.get('peeling_price'),
        image_url=data.get('image_url')
    )
    
    db.session.add(new_product)
    db.session.commit()
    
    return jsonify({'message': 'Produit créé avec succès'}), 201

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

# NO IDEA WHY THIS DOESN T WORK !!!!
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
#  ADMIN APIS
###################################################################
@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    data = request.get_json()
    admin = Admin.query.filter_by(email=data['email']).first()
    
    if admin and check_password_hash(admin.password, data['password']):
        access_token = create_access_token(
            identity=str(admin.id), 
            additional_claims={'is_admin': True}   
        )

        return jsonify({
            'token': access_token,
            'admin_id': admin.id
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

# @app.route('/api/admin/users/<int:user_id>/status', methods=['PUT'])
# @jwt_required()
# def update_user_status(user_id):
#     if not is_admin():
#         return jsonify({'error': 'Accès non autorisé'}), 403
    
#     user = User.query.get_or_404(user_id)
#     data = request.get_json()
#     print(type(data['active']))
    
#     if 'active' in data:
#         user.active = data['active']
#         db.session.commit()
#         status = 'activé' if data['active'] else 'désactivé'
#         return jsonify({'message': f'Compte utilisateur {status} avec succès'})
    
#     return jsonify({'error': 'Données invalides'}), 400

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

# print(app.url_map)



#sorry i had to test this 
@app.route('/api/orders/<int:order_id>', methods=['DELETE'])
@jwt_required()
def remove_from_cart(order_id):
    current_user_id = get_jwt_identity()
    order = Order.query.get_or_404(order_id)
    
    if int(order.buyer_id) != int(current_user_id):
        return jsonify({'error': 'Non autorisé'}), 403
        
    # Return the quantity to the product
    product = Product.query.get(order.product_id)
    if product:
        product.quantity += order.quantity
    
    db.session.delete(order)
    db.session.commit()
    
    return jsonify({'message': 'Article supprimé du panier'})

@app.route('/api/orders/<int:order_id>', methods=['PUT'])
@jwt_required()
def update_cart_item(order_id):
    current_user_id = get_jwt_identity()
    order = Order.query.get_or_404(order_id)
    
    if int(order.buyer_id) != int(current_user_id):
        return jsonify({'error': 'Non autorisé'}), 403
        
    data = request.get_json()
    product = Product.query.get(order.product_id)
    
    if 'quantity' in data:
        # Check if enough stock available
        quantity_diff = data['quantity'] - order.quantity
        if product.quantity < quantity_diff:
            return jsonify({'error': 'Stock insuffisant'}), 400
            
        # Update product quantity
        product.quantity -= quantity_diff
        order.quantity = data['quantity']
        
    if 'peeling_requested' in data:
        order.peeling_requested = data['peeling_requested']
    
    # Recalculate total price
    order.total_price = order.quantity * product.price
    if order.peeling_requested:
        order.total_price += order.quantity * product.peeling_price
    
    db.session.commit()
    return jsonify({'message': 'Panier mis à jour'})


if __name__ == '__main__':
    app.run(debug=True)

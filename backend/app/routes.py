from flask import Blueprint, request, jsonify
import requests
import uuid
from datetime import datetime
from app.config import SECRET_KEY
from app.supabase_utils import supabase
import logging

# Set up logger properly
logger = logging.getLogger(__name__)
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

routes = Blueprint("routes", __name__) 

def generate_order_reference():
    """Generate a unique order reference with date-time and UUID."""
    now = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    unique_id = str(uuid.uuid4()).replace("-", "")[:16] 
    return f"{now}-{unique_id}"

@routes.route("/api/create-payment-session", methods=["POST"])
def create_payment_session():
    try:
        logger.debug("Request received at /api/create-payment-session")
        logger.debug("Request data: %s", request.json)

        # Extract data from the request body
        data = request.json
        currency = data.get("currency", "GBP")
        address = data.get("address", {})
        items = data.get("items", [])

        if not items:
            logger.error("No items in the cart")
            return jsonify({"error": "At least one item must be in the cart"}), 400

        # Calculate the total amount dynamically
        amount = sum(item["price"] * item["units"] for item in items)

        if amount <= 0:
            logger.error(" Invalid amount: %s", amount)
            return jsonify({"error": "Amount must be greater than zero"}), 400

        # Generate unique order reference
        order_ref = generate_order_reference()

        # Checkout.com API URL
        url = "https://api.sandbox.checkout.com/payment-sessions"

        # Format items for Checkout.com
        formatted_items = [
            {
                "name": item["name"],
                "quantity": item["units"],
                "unit_price": int(item["price"] * 100),
                "total_amount": int(item["price"] * item["units"] * 100),
            }
            for item in items
        ]

        # Payload for Checkout.com
        payload = {
            "amount": int(amount * 100),
            "currency": currency,
            "payment_type": "Regular",
            "success_url": f"https://checkout-project-ify-nwezes-projects.vercel.app/checkout-success?order_ref={order_ref}",  
            "failure_url": f"https://checkout-project-ify-nwezes-projects.vercel.app/checkout-failure?order_ref={order_ref}", 
            "enabled_payment_methods": ["googlepay", "applepay", "paypal", "card"],
            "processing_channel_id": "pc_zs5fqhybzc2e3jmq3efvybybpq",
            "billing": {
                "address": {
                    "address_line1": address.get("street", "123 High St."),
                    "address_line2": address.get("address_line2", ""),
                    "city": address.get("city", "London"),
                    "state": address.get("state", "London"),
                    "zip": address.get("postcode", "SW1A 1AA"),
                    "country": address.get("country", "GB")
                },
                "phone": {
                    "country_code": "+44",
                    "number": address.get("phone", "07123456789")
                }
            },
            "customer": {
                "email": address.get("email", "test.customer@example.com"),
                "name": address.get("fullName", "Test Customer"),
                "phone": {
                    "country_code": "+44",
                    "number": address.get("phone", "07123456789")
                }
            },
            "items": formatted_items,
            "metadata": {
                "order_ref": order_ref  # here we attach the order reference
            }
        }

        # API Headers
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {SECRET_KEY}",
        }

        logger.debug(" Sending request to Checkout.com with payload: %s", payload)

        # Make the request to Checkout.com
        response = requests.post(url, json=payload, headers=headers)
        response_data = response.json()

        # Log response
        logger.debug(" Complete Checkout.com response: %s", response_data)

        if response.status_code == 201:
            logger.debug(" Payment session created successfully.")
            return jsonify(response_data), 201

        error_message = response_data.get('error_type', 'Unknown error occurred')
        logger.error(" Checkout.com error response: %s", error_message)
        return jsonify({
            "error": error_message,
            "status": response.status_code,
            "details": response_data
        }), response.status_code

    except Exception as e:
        logger.exception(" Unexpected error in create_payment_session: %s", str(e))
        return jsonify({"error": str(e), "status": "error"}), 500

@routes.route("/api/get-order-ref", methods=["GET"])
def get_order_reference():
    """Fetch order reference based on payment_id from webhook data"""
    payment_id = request.args.get("payment_id")
    if not payment_id:
        return jsonify({"error": "Missing payment_id"}), 400

    response = supabase.table("checkout_payments").select("order_ref").eq("payment_id", payment_id).execute()

    if response.data:
        return jsonify({"order_ref": response.data[0]["order_ref"]}), 200
    else:
        return jsonify({"error": "Order reference not found"}), 404

@routes.route("/api/recent-payments", methods=["GET"])
def get_recent_payments():
    """Fetch the 20 most recent payment records from Supabase."""
    try:
        response = supabase.table("checkout_payments") \
            .select("*") \
            .order("created_at", desc=True) \
            .limit(20) \
            .execute()

        return jsonify({"payments": response.data})  

    except Exception as e:
        return jsonify({"error": str(e)}), 500

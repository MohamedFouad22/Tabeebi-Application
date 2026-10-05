import Stripe from "stripe";
import { BadRequestException } from "../../Security/Error/global.error.utils";

class StripeServices {
  private stripe: Stripe;
  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
  }

  async createSession({
    success_url = process.env.STRIPE_SUCCESS_URL as string,
    cancel_url = process.env.STRIPE_CANCEL_URL as string,
    metadata = {},
    line_items = [],
    mode = "payment",
    customer_email = "",
    discounts = [],
  }: Stripe.Checkout.SessionCreateParams): Promise<Stripe.Checkout.Session> {
    const session = await this.stripe.checkout.sessions.create({
      success_url,
      cancel_url,
      metadata,
      line_items,
      mode,
      customer_email,
      discounts,
    });
    return session;
  }

  async constructEvent({
    payload,
    signature,
    secret = process.env.STRIPE_WEBHOOK_SECRET as string,
  }: {
    payload: string | Buffer;
    signature: string;
    secret?: string;
  }): Promise<Stripe.Event> {
    return this.stripe.webhooks.constructEvent(payload, signature, secret);
  }

  async createPaymentMethod(data: Stripe.PaymentMethodCreateParams) {
    const method = await this.stripe.paymentMethods.create(data);
    return method;
  }

  async createPaymentIntent(data: Stripe.PaymentIntentCreateParams) {
    const intent = await this.stripe.paymentIntents.create(data);
    return intent;
  }

  async paymentRetrieve(id: string) {
    const intent = await this.stripe.paymentIntents.retrieve(id);
    return intent;
  }

  async confirmPaymentIntent(id: string) {
    const intent = await this.paymentRetrieve(id);
    if (!intent) throw new BadRequestException("Invalid Payment Intent ID");

    const confirmIntent = await this.stripe.paymentIntents.confirm(id);
    return confirmIntent;
  }

  async verifyPaymentIntent(id: string) {
    const intent = await this.paymentRetrieve(id);
    if (!intent) {
      throw new BadRequestException("Invalid Payment Intent ID");
    }
    console.log(intent);

    if (intent.status !== "succeeded") {
      throw new BadRequestException("Payment has not been completed");
    }

    return intent;
  }

  async refundPayment(paymentIntentId: string) {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
      });

      return refund;
    } catch (error: any) {
      if (error.type === "StripeInvalidRequestError") {
        throw new BadRequestException(error.message);
      }

      throw error;
    }
  }
}
export default new StripeServices();

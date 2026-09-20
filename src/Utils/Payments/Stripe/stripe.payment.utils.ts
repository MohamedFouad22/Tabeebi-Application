import Stripe from "stripe";

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
}
export default new StripeServices();

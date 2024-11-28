export type PlanType = 'free' | 'pro' | 'business';

interface Plan {
  name: string;
  price: number;
  features: string[];
  videoLimit: number;
  paypalLink: string;
}

export class PaymentService {
  private static readonly PAYPAL_USERNAME = process.env.PAYPAL_ME_USERNAME;
  private static readonly PRO_PLAN_PRICE = process.env.PRO_PLAN_PRICE;
  private static readonly BUSINESS_PLAN_PRICE = process.env.BUSINESS_PLAN_PRICE;

  static readonly plans: Record<PlanType, Plan> = {
    free: {
      name: 'Free',
      price: 0,
      features: [
        '5 videos per month',
        'Basic transcription',
        'TXT export',
        'YouTube video preview',
      ],
      videoLimit: 5,
      paypalLink: '',
    },
    pro: {
      name: 'Pro',
      price: Number(this.PRO_PLAN_PRICE),
      features: [
        '50 videos per month',
        'AI-powered enhancement',
        'All export formats',
        'Priority processing',
        'No watermark',
        'Email support',
      ],
      videoLimit: 50,
      paypalLink: `https://paypal.me/${this.PAYPAL_USERNAME}/${this.PRO_PLAN_PRICE}`,
    },
    business: {
      name: 'Business',
      price: Number(this.BUSINESS_PLAN_PRICE),
      features: [
        'Unlimited videos',
        'Advanced AI features',
        'Priority support',
        'Custom branding',
        'API access',
        'Bulk processing',
      ],
      videoLimit: Infinity,
      paypalLink: `https://paypal.me/${this.PAYPAL_USERNAME}/${this.BUSINESS_PLAN_PRICE}`,
    },
  };

  static getPlan(planType: PlanType): Plan {
    return this.plans[planType];
  }

  static getPaymentLink(planType: PlanType): string {
    const plan = this.plans[planType];
    if (!plan || plan.price === 0) {
      throw new Error('Invalid plan type or free plan selected');
    }
    return plan.paypalLink;
  }

  static getVideoLimit(planType: PlanType): number {
    return this.plans[planType].videoLimit;
  }

  static formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  }
}

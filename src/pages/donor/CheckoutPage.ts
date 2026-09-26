import { BasePage } from '../BasePage';

export class CheckoutPage extends BasePage {
  async pay(cardNumber: string): Promise<void> {
    await this.page.fill('#card-number', cardNumber);
    await this.page.click('#checkout-form button[type="submit"]');
    await this.page.waitForURL(/confirmation\.html/);
  }
}

import { BasePage } from '../BasePage';

export class DonatePage extends BasePage {
  async donate(amount: number): Promise<void> {
    await this.page.fill('#amount', String(amount));
    await this.page.click('#donate-form button[type="submit"]');
    await this.page.waitForURL(/checkout\.html/);
  }
}

import { BasePage } from '../BasePage';

export class RegisterPage extends BasePage {
  async open(): Promise<void> {
    await this.goto('/donor/register.html');
  }

  async register(name: string, email: string): Promise<void> {
    await this.page.fill('#name', name);
    await this.page.fill('#email', email);
    await this.page.click('#register-form button[type="submit"]');
    await this.page.waitForURL(/donate\.html/);
  }
}

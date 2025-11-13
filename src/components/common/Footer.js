import { Component } from "@/core/Component";

const Footer = Component({
  template: (context) => {
    return `
          <div class="max-w-md mx-auto py-8 text-center text-gray-500">
              <p>© ${context.state.today.getFullYear()} 항해플러스 프론트엔드 쇼핑몰</p>
          </div>
      </footer>
    `;
  },
  initialState: () => ({
    today: new Date(),
  }),
});

export default Footer;

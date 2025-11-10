import header from "../components/common/header.js";
import footer from "../components/common/footer.js";

export default function mainLayout(children) {
  return `
    <div class="bg-gray-50">
      ${header({ cartNum: 4 })}
      ${children()}
      ${footer()}
    </div>
  `;
}

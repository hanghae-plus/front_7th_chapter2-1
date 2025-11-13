import { Component } from "../../../core/component/Component";

export class LimitSelect extends Component {
  setEvents() {
    // 페이지당 상품 수 변경 이벤트
    this.addEventListener("change", '[id="limit-select"]', (e) => this.props.onLimitChange(Number(e.target.value)));
  }

  template() {
    const { limit = 20 } = this.props;
    return html`
      <div class="flex items-center gap-2">
        <label class="text-sm text-gray-600">개수:</label>
        <select
          id="limit-select"
          class="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="10" ${String(limit) === "10" ? "selected" : ""}>10개</option>
          <option value="20" ${String(limit) === "20" ? "selected" : ""}>20개</option>
          <option value="50" ${String(limit) === "50" ? "selected" : ""}>50개</option>
          <option value="100" ${String(limit) === "100" ? "selected" : ""}>100개</option>
        </select>
      </div>
    `;
  }
}

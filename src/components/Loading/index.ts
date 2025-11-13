import { Skeleton } from "./Skeleton";
import { Spinner } from "./Spinner";

export const Loading = /* html */ `
    <div>
        <div class="grid grid-cols-2 gap-4 mb-6" id="products-grid">
            ${Skeleton.repeat(8)}
        </div>
        <div class="text-center py-4">
            ${Spinner}
        </div>
    </div>
`;

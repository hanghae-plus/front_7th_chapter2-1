import { CompnentElementNode } from "@core/jsx/factory";
import { currentRenderingNode } from "@core/render";
import { cloneDeep, isEqual, isNil } from "es-toolkit";
import { nextTick } from "../../shared/components/utils/nextTick";

export type CallbackReturn = any | (() => any);

type VoidCallbackReturn = void | (() => void);

export function useEffect<Dep extends any[]>(
  callback: () => VoidCallbackReturn,
  dependencies: Dep,
) {
  if (!(currentRenderingNode instanceof CompnentElementNode)) {
    throw new Error("currentRenderingNode is not an object");
  }

  if (
    isNil(currentRenderingNode.sideEffects) ||
    isNil(currentRenderingNode.sideEffectsCursor)
  ) {
    throw new Error(
      "parentNode.sideEffects or parentNode.sideEffectsCursor is not set",
    );
  }

  const { sideEffects, sideEffectsCursor } = currentRenderingNode;

  const targetSideEffect = sideEffects[sideEffectsCursor];
  currentRenderingNode.sideEffectsCursor++;

  if (isNil(targetSideEffect)) {
    nextTick().then(() => {
      const cleanup = callback();

      sideEffects[sideEffectsCursor] = {
        callback: callback as any,
        dependencies: cloneDeep(dependencies),
        cleanup: cleanup as any,
      };
    });

    return;
  }

  const hasChanged = !isEqual(targetSideEffect.dependencies, dependencies);

  if (hasChanged) {
    targetSideEffect.cleanup?.();
    nextTick().then(() => {
      const cleanup = callback();
      targetSideEffect.cleanup = cleanup as any;
      targetSideEffect.dependencies = cloneDeep(dependencies);
    });
  }
}

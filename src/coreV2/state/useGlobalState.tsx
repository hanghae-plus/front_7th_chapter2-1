import { cloneDeep, delay } from "es-toolkit";
import { render, renderTree } from "@core/render";
import { App } from "../../main";
import { DomNode } from "@core/jsx/factory";
import { nextTick } from "../../shared/components/utils/nextTick";

const stateMap = new Map<string, any>();

let enabled = true;

export function useGlobalState<T>(
  key: string,
  initialValue: T,
): [T, (valueOrDispatcher: T | ((value: T) => T)) => void] {
  const state = stateMap.get(key) ?? initialValue;

  function setValue(valueOrDispatcher: T | ((value: T) => T)) {
    if (typeof valueOrDispatcher === "function") {
      const dispatcher = valueOrDispatcher as (value: T) => T;
      stateMap.set(key, dispatcher(cloneDeep(state)));
    } else {
      const value = valueOrDispatcher as T;
      stateMap.set(key, value);
    }

    queueMicrotask(() => {
      if (!enabled) {
        return;
      }

      enabled = false;
      const root = document.querySelector("#root") as HTMLElement;

      root.innerHTML = "";
      render(cloneDeep(renderTree.raw!) as DomNode);

      delay(1).then(() => {
        enabled = true;
      });
    });
  }

  return [state, setValue];
}

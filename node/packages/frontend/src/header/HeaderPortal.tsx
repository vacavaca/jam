import { PropsWithChildren } from "react";
import { useHeaderContainer } from "./hooks";
import { createPortal } from "react-dom";

export function HeaderPortal({ children }: PropsWithChildren) {
    const container = useHeaderContainer()

    if (!container) {
        return null
    }

    return createPortal(children, container)
}

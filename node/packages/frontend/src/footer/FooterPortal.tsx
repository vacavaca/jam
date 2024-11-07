import { PropsWithChildren } from "react";
import { useFooterContainer } from "./hooks";
import { createPortal } from "react-dom";

export function FooterPortal({ children }: PropsWithChildren) {
    const container = useFooterContainer()

    if (!container) {
        return null
    }

    return createPortal(children, container)
}

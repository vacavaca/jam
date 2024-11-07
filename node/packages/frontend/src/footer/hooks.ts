import { useContext } from "react";
import { footerContainerContext } from "./state";

export function useFooterContainer() {
    return useContext(footerContainerContext)
}

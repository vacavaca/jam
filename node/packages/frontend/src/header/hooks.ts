import { useContext } from "react";
import { headerContainerContext } from "./state";

export function useHeaderContainer() {
    return useContext(headerContainerContext)
}

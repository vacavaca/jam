import clsx from "clsx"
import styles from "./Preloader.module.css"
import { HTMLProps } from "react"

export function Preloader(props: HTMLProps<HTMLDivElement>) {
    return (
        <div {...props} className={clsx("relative", props.className)}>
            <div className={styles.container}>
                <div className={clsx(styles.dot, styles["dot-1"])}></div>
                <div className={clsx(styles.dot, styles["dot-2"])}></div>
                <div className={clsx(styles.dot, styles["dot-3"])}></div>
            </div>

            <svg xmlns="http://www.w3.org/2000/svg" version="1.1">
                <defs>
                    <filter id="goo">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
                        <feColorMatrix
                            in="blur"
                            mode="matrix"
                            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 25 -9"
                        />
                    </filter>
                </defs>
            </svg>
        </div>
    )
}

type Props = {
    onContainer: (container: HTMLElement | null) => unknown
}

export function Footer({ onContainer }: Props) {
    return (
        <>
            <div ref={onContainer} className="max-w-[34rem] mx-auto flex flex-row items-start gap-4 py-4 px-6 bg-white fixed inset-x-0 bottom-0 z-50">
            </div>
        </>
    )
}

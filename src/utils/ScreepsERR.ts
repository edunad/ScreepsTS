export const throwError = (err: string): void => {
    console.log(`<span style='color:red'>${err}</span>`);
}

export const catchError = (run: () => any) => {
    try {
        return run();
    } catch (err) {
        throwError(err);
    }
};

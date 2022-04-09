export const catchError = (run: () => void) => {
    try {
        run();
    } catch (err) {
        console.log(`<span style='color:red'>${err}</span>`);
    }
};
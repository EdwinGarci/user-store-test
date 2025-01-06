export class CreateCategoryDto {
    private constructor(
        public readonly name: string,
        public readonly available: boolean,
    ) {}

    static create(object: { [key: string]: any }): [ string?, CreateCategoryDto? ] {
        const { name, available = false } = object;

        if (!name) {
            return ['Missing name'];
        }

        let availableBoolean: boolean;
        if (available === true || available === 'true') {
            availableBoolean = true;
        } else if (available === false || available === 'false') {
            availableBoolean = false;
        } else {
            return ['Invalid value for "available". Must be a boolean or "true"/"false" string.'];
        }

        return [undefined, new CreateCategoryDto(name, availableBoolean)];
    }
}

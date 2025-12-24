//middleware factory to validate parts of the request

const validate = (schema, property = 'body') => {
    return async (req, res, next) => {
        try {
            const value = req[property];
            const validated = await schema.validateAsync(value, {
                abortEarly: false,
                stripUnknown: true,
                convert: true,
            });

            //assign the validated value back
            req[property] = validated;
            return next() 

        } catch (error) {
            //Joi error
            console.log(error.details);
            const message = error.details?.map(d => d.message) || [error.message];
            return res.status(400).json({
                success: false,
                message: "Validation Failed ",
                error
            })
        }
    }
}

export {validate}
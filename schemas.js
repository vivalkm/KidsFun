const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

// create extension for sanitizing string inputs and stripping off the html tags
const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not contain any html tags.',
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value });
                return clean;
            }
        }
    }
});

// extend JOI
const Joi = BaseJoi.extend(extension);

const activitySchema = Joi.object({
    activity: Joi.object({
        title: Joi.string().required().escapeHTML(),
        location: Joi.string().required().escapeHTML(),
        price: Joi.number().min(0).required(),
        description: Joi.string().required().escapeHTML()
    }).required(),
    deleteImgs: Joi.array()
});

const reviewSchema = Joi.object({
    review: Joi.object({
        body: Joi.string().required().escapeHTML(),
        rating: Joi.number().min(1).max(5).required()
    }).required()
});

const userSchema = Joi.object({
    user: Joi.object({
        username: Joi.string().required().escapeHTML(),
        email: Joi.string().required().escapeHTML(),
        password: Joi.string().required(),
    }).required()
});

module.exports = { activitySchema, reviewSchema, userSchema };




// schemas/slotSchema.js

const slotSchema = {
    date: {
        type: String,
        required: true,
        // Format: YYYY-MM-DD
    },
    slots: {
        "9am-12pm": {
            type: Array,
            default: [],
            // Contains user ObjectIds
        },
        "12pm-3pm": {
            type: Array,
            default: [],
            // Contains user ObjectIds
        },
        "3pm-6pm": {
            type: Array,
            default: [],
            // Contains user ObjectIds
        },
        "6pm-9pm": {
            type: Array,
            default: [],
            // Contains user ObjectIds
        }
    }
}

export default slotSchema;
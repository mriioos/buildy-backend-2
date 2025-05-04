const swaggerJsdoc = require("swagger-jsdoc");
const options = {
    definition : {
        openapi : "3.0.3",
        info : {
            title : "Buildy Backend 2 - Express API with Swagger (OpenAPI 3.0)",
            version : "0.1.0",
            description : "This is a RESTful API application made with Express and documented with Swagger",
            license : {
                name : "MIT",
                url : "https://spdx.org/licenses/MIT.html",
            },
            contact : {
                name : "u-tad",
                url : "https://u-tad.com",
                email : "miguel.marcos@live.u-tad.com",
            },
        },
        servers: [
            {
                url : "http://localhost:3000",
            },
        ],
        components : {
            securitySchemes : {
                bearerAuth : {
                    type : "http",
                    scheme : "bearer",
                    bearerFormat : "JWT"
                },
            },
            responses: {
                InternalServerError: {
                    description: "Internal Server Error",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: '#/components/schemas/InternalServerError'
                            }
                        }
                    }
                },
                BadRequestError: {
                    description: "Bad Request",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: '#/components/schemas/BadRequestError'
                            }
                        }
                    }
                },
                UnauthorizedError: {
                    description: "Unauthorized",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: '#/components/schemas/UnauthorizedError'
                            }
                        }
                    }
                },
                ForbiddenError: {
                    description: "Forbidden",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: '#/components/schemas/ForbiddenError'
                            }
                        }
                    }
                },
            },
            schemas : {
                user : {
                    type : "object",
                    required : ["_id", "email", "validated", "role", "name", "lastname", "nif", "company", "logo"],
                    properties : {
                        _id : {
                            type : "string",
                            example : "1234567890abcdef12345678"
                        },
                        email : {
                            type : "string",
                            example : "john.doe@domain.ext"
                        },
                        validated : {
                            type : "boolean",
                            example : true
                        },
                        role : {
                            type : "string",
                            enum : ["admin", "user", "guest"],
                            example : "admin"
                        },
                        name : {
                            type : "string",
                            example : "John"
                        },
                        lastname : {
                            type : "string",
                            example : "Doe"
                        },
                        nif : {
                            type : "string",
                            example : "12345678A"
                        },
                        company : {
                            type : "string",
                            example : "Example Company"
                        },
                        logo : {
                            type : "string",
                            example : "https://example.com/logo.png"
                        }
                    }
                },
                client : {
                    type : "object",
                    required : ["_id", "user_id", "email", "name", "lastname", "address", "createdAt"],
                    properties : {
                        _id : {
                            type : "string",
                            example : "1234567890abcdef12345678"
                        },
                        user_id : {
                            type : "string",
                            example : "1234567890abcdef12345678"
                        },
                        email : {
                            type : "string",
                            example : "john.doe@example.ext"
                        },
                        name : {
                            type : "string",
                            example : "John"
                        },
                        lastname : {
                            type : "string",
                            example : "Doe"
                        },
                        address : {
                            type : "string",
                            example : "Calle del Ejemplo, 123, 1ºA, 28001 Madrid (Spain)"
                        },
                        createdAt : {
                            type : "string",
                            format : "date-time",
                            example : "2023-10-01T12:00:00Z"
                        }
                    }
                },
                project : {
                    type : "object",
                    required : ["_id", "client_id", "name", "description", "createdAt"],
                    properties : {
                        _id : {
                            type : "string",
                            example : "1234567890abcdef12345678"
                        },
                        client_id : {
                            type : "string",
                            example : "1234567890abcdef12345678"
                        },
                        name : {
                            type : "string",
                            example : "Project Name"
                        },
                        description : {
                            type : "string",
                            example : "Project Description"
                        },
                        createdAt : {
                            type : "string",
                            format : "date-time",
                            example : "2023-10-01T12:00:00Z"
                        }
                    }
                },
                deliverynote : {
                    type : "object",
                    required : ["_id", "project_id", "data", "signature", "createdAt"],
                    properties : {
                        _id : {
                            type : "string",
                            example : "1234567890abcdef12345678"
                        },
                        project_id : {
                            type : "string",
                            example : "1234567890abcdef12345678"
                        },
                        data : {
                            type : "array",
                            items : {
                                type : "object",
                                properties : {
                                    type : {
                                        type : "string",
                                        enum : ["person", "material"],
                                        example : "person"
                                    },
                                    name : {
                                        type : "string",
                                        example : "John Doe"
                                    },
                                    quantity : {
                                        type : "number",
                                        example : 10 // Hours or price of material
                                    }
                                }
                            }
                        },
                        signature : {
                            type : "string",
                            example : null
                        },
                        createdAt : {
                            type : "string",
                            format : "date-time",
                            example : "2023-10-01T12:00:00Z"
                        }
                    }
                },
                error : {
                    type : "object",
                    required : ["errors"],
                    properties : {
                        errors : {
                            type : "array",
                            items : {
                                type : "string",
                                example : "Error message"
                            }
                        }
                    }
                },
                BadRequestError : {
                    type : "object",
                    required : ["errors"],
                    properties : {
                        errors : {
                            type : "array",
                            items : {
                                type : "string",
                                example : "Bad Request. Invalid body format"
                            }
                        }
                    }
                },
                UnauthorizedError : {
                    type : "object",
                    required : ["errors"],
                    properties : {
                        errors : {
                            type : "array",
                            items : {
                                type : "string",
                                enum : [
                                    "Unauthorized. Invalid token",
                                    "Unauthorized. Token expired",
                                    "Unauthorized. Token not found"
                                ],
                                example : "Unauthorized. Token not found"
                            }
                        }
                    }
                },
                ForbiddenError : {
                    type : "object",
                    required : ["errors"],
                    properties : {
                        errors : {
                            type : "array",
                            items : {
                                type : "string",
                                enum : [
                                    "Forbidden. User not found",
                                    "Forbidden. User email not validated"
                                ],
                                example : "Forbidden. User not found"
                            }
                        }
                    }
                },
                InternalServerError : {
                    type : "object",
                    required : ["errors"],
                    properties : {
                        errors : {
                            type : "array",
                            items : {
                                type : "string",
                                enum : [
                                    "Internal Server Error. Try again later",
                                    "Unknown error"
                                ],
                                example : "Internal Server Error. Try again later"
                            }
                        }
                    }
                }
            },
            security : [{ bearerAuth : [] }]
        },
    },
    apis : ["./src/routes/*.js"],
};

module.exports = swaggerJsdoc(options);
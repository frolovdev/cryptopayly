export type Cryptopayly = {
  "version": "0.1.0",
  "name": "cryptopayly",
  "constants": [
    {
      "name": "USER_TAG",
      "type": "bytes",
      "value": "[85, 83, 69, 82, 95, 83, 84, 65, 84, 69]"
    },
    {
      "name": "PAYMENT_LINK_TAG",
      "type": "bytes",
      "value": "[80, 65, 89, 77, 69, 78, 84, 95, 76, 73, 78, 75, 95, 83, 84, 65, 84, 69]"
    }
  ],
  "instructions": [
    {
      "name": "createUserProfile",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "createPaymentLink",
      "accounts": [
        {
          "name": "userProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "paymentLinkAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "paymentLinkCreateInput",
          "type": {
            "defined": "PaymentLinkCreateInput"
          }
        }
      ]
    },
    {
      "name": "updatePaymentLink",
      "accounts": [
        {
          "name": "paymentLinkAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "paymentLinkIdx",
          "type": "u8"
        },
        {
          "name": "updatePaymentLinkInput",
          "type": {
            "defined": "UpdatePaymentLinkInput"
          }
        }
      ]
    },
    {
      "name": "removePaymentLink",
      "accounts": [
        {
          "name": "userProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "paymentLinkAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "paymentLinkIdx",
          "type": "u8"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "paymentLinkAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "currency",
            "type": {
              "defined": "Currency"
            }
          },
          {
            "name": "reference",
            "type": "publicKey"
          },
          {
            "name": "idx",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "userProfileAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "lastPaymentLink",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "PaymentLinkCreateInput",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "currency",
            "type": {
              "defined": "Currency"
            }
          },
          {
            "name": "reference",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "UpdatePaymentLinkInput",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "amount",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "currency",
            "type": {
              "option": {
                "defined": "Currency"
              }
            }
          }
        ]
      }
    },
    {
      "name": "Currency",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Sol"
          },
          {
            "name": "Usdc"
          }
        ]
      }
    }
  ]
};

export const IDL: Cryptopayly = {
  "version": "0.1.0",
  "name": "cryptopayly",
  "constants": [
    {
      "name": "USER_TAG",
      "type": "bytes",
      "value": "[85, 83, 69, 82, 95, 83, 84, 65, 84, 69]"
    },
    {
      "name": "PAYMENT_LINK_TAG",
      "type": "bytes",
      "value": "[80, 65, 89, 77, 69, 78, 84, 95, 76, 73, 78, 75, 95, 83, 84, 65, 84, 69]"
    }
  ],
  "instructions": [
    {
      "name": "createUserProfile",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "createPaymentLink",
      "accounts": [
        {
          "name": "userProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "paymentLinkAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "paymentLinkCreateInput",
          "type": {
            "defined": "PaymentLinkCreateInput"
          }
        }
      ]
    },
    {
      "name": "updatePaymentLink",
      "accounts": [
        {
          "name": "paymentLinkAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "paymentLinkIdx",
          "type": "u8"
        },
        {
          "name": "updatePaymentLinkInput",
          "type": {
            "defined": "UpdatePaymentLinkInput"
          }
        }
      ]
    },
    {
      "name": "removePaymentLink",
      "accounts": [
        {
          "name": "userProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "paymentLinkAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "paymentLinkIdx",
          "type": "u8"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "paymentLinkAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "currency",
            "type": {
              "defined": "Currency"
            }
          },
          {
            "name": "reference",
            "type": "publicKey"
          },
          {
            "name": "idx",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "userProfileAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "lastPaymentLink",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "PaymentLinkCreateInput",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "currency",
            "type": {
              "defined": "Currency"
            }
          },
          {
            "name": "reference",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "UpdatePaymentLinkInput",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "amount",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "currency",
            "type": {
              "option": {
                "defined": "Currency"
              }
            }
          }
        ]
      }
    },
    {
      "name": "Currency",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Sol"
          },
          {
            "name": "Usdc"
          }
        ]
      }
    }
  ]
};

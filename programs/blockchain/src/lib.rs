use anchor_lang::prelude::*;

declare_id!("4UkwwLXf1n6pNgcWDWCUE21NQkvTVZGJsdPcmppL2F8j");

pub mod constant;

#[program]
pub mod cryptopayly {

    use super::*;

    pub fn create_user_profile(ctx: Context<CreateUserProfile>) -> Result<()> {
        let user_profile = &mut ctx.accounts.user_profile;
        user_profile.authority = ctx.accounts.authority.key();
        user_profile.last_payment_link = 0;
        Ok(())
    }

    pub fn create_payment_link(
        ctx: Context<CreatePaymentLink>,
        payment_link_create_input: PaymentLinkCreateInput,
    ) -> Result<()> {
        let payment_link_account = &mut ctx.accounts.payment_link_account;
        let user_profile = &mut ctx.accounts.user_profile;

        payment_link_account.authority = ctx.accounts.authority.key();

        payment_link_account.amount = payment_link_create_input.amount;
        payment_link_account.currency = payment_link_create_input.currency;
        payment_link_account.idx = user_profile.last_payment_link;
        payment_link_account.reference = payment_link_create_input.reference;

        user_profile.last_payment_link = user_profile.last_payment_link.checked_add(1).unwrap();

        Ok(())
    }

    pub fn update_payment_link(
        ctx: Context<UpdatePaymentLink>,
        _payment_link_idx: u8,
        update_payment_link_input: UpdatePaymentLinkInput,
    ) -> Result<()> {
        let payment_link_account = &mut ctx.accounts.payment_link_account;

        if let Some(amount) = update_payment_link_input.amount {
            payment_link_account.amount = amount
        }

        if let Some(currency) = update_payment_link_input.currency {
            payment_link_account.currency = currency
        }

        Ok(())
    }

    pub fn remove_payment_link(ctx: Context<RemovePaymentLink>, _payment_link_idx: u8) -> Result<()> {
        Ok(())
    }
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct PaymentLinkCreateInput {
    pub amount: u64,
    pub currency: Currency,
    pub reference: Pubkey,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdatePaymentLinkInput {
    pub amount: Option<u64>,
    pub currency: Option<Currency>,
}

#[derive(Accounts)]
pub struct CreatePaymentLink<'info> {
    #[account(mut, seeds = [constant::USER_TAG, authority.key().as_ref(),  ], bump, has_one = authority )]
    pub user_profile: Box<Account<'info, UserProfileAccount>>,

    #[account(init,
         seeds = [constant::PAYMENT_LINK_TAG, authority.key().as_ref(), &[user_profile.last_payment_link]],
         bump,
         payer = authority,
         space = 8 + std::mem::size_of::<PaymentLinkAccount>())]
    pub payment_link_account: Box<Account<'info, PaymentLinkAccount>>,

    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(payment_link_idx: u8)]
pub struct UpdatePaymentLink<'info> {
    #[account(
            mut,
            seeds = [constant::PAYMENT_LINK_TAG, authority.key().as_ref(), &[payment_link_idx]],
            bump,
            has_one = authority,
         )]
    pub payment_link_account: Box<Account<'info, PaymentLinkAccount>>,

    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(payment_link_idx: u8)]
pub struct  RemovePaymentLink<'info> {
    #[account(mut, seeds = [constant::USER_TAG, authority.key().as_ref(),  ], bump, has_one = authority )]
    pub user_profile: Box<Account<'info, UserProfileAccount>>,

    #[account(mut, close = authority, seeds = [constant::PAYMENT_LINK_TAG, authority.key().as_ref(), &[payment_link_idx]], bump, has_one = authority )]
    pub payment_link_account: Box<Account<'info, PaymentLinkAccount>>,


    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}


#[account]
pub struct PaymentLinkAccount {
    pub authority: Pubkey,
    pub amount: u64,
    pub currency: Currency,
    pub reference: Pubkey,
    pub idx: u8,
}

#[derive(AnchorDeserialize, AnchorSerialize, Clone)]
pub enum Currency {
    Sol,
    Usdc,
}

#[derive(Accounts)]
pub struct CreateUserProfile<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        seeds = [constant::USER_TAG, authority.key().as_ref()],
        bump,
         payer = authority,
        space = 8 + std::mem::size_of::<UserProfileAccount>())]
    pub user_profile: Box<Account<'info, UserProfileAccount>>,

    pub system_program: Program<'info, System>,
}

#[account]
pub struct UserProfileAccount {
    pub authority: Pubkey,
    pub last_payment_link: u8,
}

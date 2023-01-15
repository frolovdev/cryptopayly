import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Cryptopayly } from "../target/types/cryptopayly";

describe("cryptopayly", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Cryptopayly as Program<Cryptopayly>;

  const userSeed = anchor.utils.bytes.utf8.encode("USER_STATE");
  const paymentLinkSeed = anchor.utils.bytes.utf8.encode("PAYMENT_LINK_STATE");

  it("creates user profile", async () => {
    // Add your test here.
    const my_account = anchor.web3.Keypair.generate();

    const signature = await provider.connection.requestAirdrop(
      my_account.publicKey,
      10000000000
    );

    const latestBlockHash = await provider.connection.getLatestBlockhash();
    await program.provider.connection.confirmTransaction({
      signature,
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    });

    const [userProfilePubKey] = anchor.web3.PublicKey.findProgramAddressSync(
      [userSeed, my_account.publicKey.toBytes()],
      program.programId
    );
    await program.methods
      .createUserProfile()
      .accounts({
        authority: my_account.publicKey,
        userProfile: userProfilePubKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([my_account])
      .rpc();

    const userProfile = await program.account.userProfileAccount.fetch(
      userProfilePubKey
    );

    expect(userProfile.authority).toEqual(my_account.publicKey);
    expect(userProfile.lastPaymentLink).toEqual(0);
  });

  it("creates payment link", async () => {
    // Add your test here.
    const my_account = anchor.web3.Keypair.generate();

    const signature = await provider.connection.requestAirdrop(
      my_account.publicKey,
      10000000000
    );

    const latestBlockHash = await provider.connection.getLatestBlockhash();
    await program.provider.connection.confirmTransaction({
      signature,
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    });

    const [userProfilePubKey] = anchor.web3.PublicKey.findProgramAddressSync(
      [userSeed, my_account.publicKey.toBytes()],
      program.programId
    );
    await program.methods
      .createUserProfile()
      .accounts({
        authority: my_account.publicKey,
        userProfile: userProfilePubKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([my_account])
      .rpc();

    let userProfile = await program.account.userProfileAccount.fetch(
      userProfilePubKey
    );

    const [paymentLinkAccountPubKey] =
      anchor.web3.PublicKey.findProgramAddressSync(
        [
          paymentLinkSeed,
          my_account.publicKey.toBytes(),
          new anchor.BN(userProfile.lastPaymentLink).toBuffer(),
        ],
        program.programId
      );

    const reference = anchor.web3.Keypair.generate().publicKey;

    await program.methods
      .createPaymentLink({
        amount: new anchor.BN(100),
        currency: { sol: {} },
        reference,
      })
      .accounts({
        authority: userProfile.authority,
        userProfile: userProfilePubKey,
        paymentLinkAccount: paymentLinkAccountPubKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([my_account])
      .rpc();

    const paymentLinkAccount = await program.account.paymentLinkAccount.fetch(
      paymentLinkAccountPubKey
    );

    userProfile = await program.account.userProfileAccount.fetch(
      userProfilePubKey
    );

    expect(userProfile.lastPaymentLink).toEqual(1);
    expect(paymentLinkAccount.idx).toEqual(0);
    expect(paymentLinkAccount.reference).toEqual(reference);
    expect(paymentLinkAccount.amount.toJSON()).toEqual(
      new anchor.BN("100").toJSON()
    );
    expect(paymentLinkAccount.currency).toEqual({ sol: {} });
  });

  it("updates payment link", async () => {
    // Add your test here.
    const my_account = anchor.web3.Keypair.generate();

    const signature = await provider.connection.requestAirdrop(
      my_account.publicKey,
      10000000000
    );

    const latestBlockHash = await provider.connection.getLatestBlockhash();
    await program.provider.connection.confirmTransaction({
      signature,
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    });

    const [userProfilePubKey] = anchor.web3.PublicKey.findProgramAddressSync(
      [userSeed, my_account.publicKey.toBytes()],
      program.programId
    );
    await program.methods
      .createUserProfile()
      .accounts({
        authority: my_account.publicKey,
        userProfile: userProfilePubKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([my_account])
      .rpc();

    const userProfile = await program.account.userProfileAccount.fetch(
      userProfilePubKey
    );

    const [paymentLinkAccountPubKey] =
      anchor.web3.PublicKey.findProgramAddressSync(
        [
          paymentLinkSeed,
          my_account.publicKey.toBytes(),
          new anchor.BN(userProfile.lastPaymentLink).toBuffer(),
        ],
        program.programId
      );

    const reference = anchor.web3.Keypair.generate().publicKey;

    await program.methods
      .createPaymentLink({
        amount: new anchor.BN(100),
        currency: { sol: {} },
        reference,
      })
      .accounts({
        authority: userProfile.authority,
        userProfile: userProfilePubKey,
        paymentLinkAccount: paymentLinkAccountPubKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([my_account])
      .rpc();

    await program.methods
      .updatePaymentLink(0, {
        amount: new anchor.BN(600),
        currency: { usdc: {} },
      })
      .accounts({
        authority: userProfile.authority,
        paymentLinkAccount: paymentLinkAccountPubKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([my_account])
      .rpc();

    const paymentLinkAccount = await program.account.paymentLinkAccount.fetch(
      paymentLinkAccountPubKey
    );

    expect(paymentLinkAccount.idx).toEqual(0);
    expect(paymentLinkAccount.reference).toEqual(reference);
    expect(paymentLinkAccount.amount.toJSON()).toEqual(
      new anchor.BN("600").toJSON()
    );
    expect(paymentLinkAccount.currency).toEqual({ usdc: {} });
  });

  it("deletes payment link", async () => {
    // Add your test here.
    const my_account = anchor.web3.Keypair.generate();

    const signature = await provider.connection.requestAirdrop(
      my_account.publicKey,
      10000000000
    );

    const latestBlockHash = await provider.connection.getLatestBlockhash();
    await program.provider.connection.confirmTransaction({
      signature,
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    });

    const [userProfilePubKey] = anchor.web3.PublicKey.findProgramAddressSync(
      [userSeed, my_account.publicKey.toBytes()],
      program.programId
    );
    await program.methods
      .createUserProfile()
      .accounts({
        authority: my_account.publicKey,
        userProfile: userProfilePubKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([my_account])
      .rpc();

    const userProfile = await program.account.userProfileAccount.fetch(
      userProfilePubKey
    );

    const [paymentLinkAccountPubKey] =
      anchor.web3.PublicKey.findProgramAddressSync(
        [
          paymentLinkSeed,
          my_account.publicKey.toBytes(),
          new anchor.BN(userProfile.lastPaymentLink).toBuffer(),
        ],
        program.programId
      );

    const reference = anchor.web3.Keypair.generate().publicKey;

    await program.methods
      .createPaymentLink({
        amount: new anchor.BN(100),
        currency: { sol: {} },
        reference,
      })
      .accounts({
        authority: userProfile.authority,
        userProfile: userProfilePubKey,
        paymentLinkAccount: paymentLinkAccountPubKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([my_account])
      .rpc();

    await program.methods
      .removePaymentLink(0)
      .accounts({
        authority: userProfile.authority,
        paymentLinkAccount: paymentLinkAccountPubKey,
        userProfile: userProfilePubKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([my_account])
      .rpc();

    const paymentLinkAccount =
      await program.account.paymentLinkAccount.fetchNullable(
        paymentLinkAccountPubKey
      );
    expect(paymentLinkAccount).toBeNull();
  });
});

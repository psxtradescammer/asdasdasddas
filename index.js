import MadfutClient, { ProfileProperty } from './madfutclient.js';
import { bot } from "./discord.js";
import db from "./db.js";
import { formatNum, normalize, sleep, getRandomInt, extractAmount } from "./util.js";
import { Constants } from 'eris';
import { once } from 'events';
import config from './config.js';
import { ObjectSet } from './util.js';
//const madfutClient = new MadfutClient(config.appCheckToken);
//let newAcount1 = await madfutClient.createAccount();
/*process.on('unhandledRejection', async (error)=>{
    newAcount1;
    signInError();
    async function signInError() {
        //let password = newAcount.password
        let newAcount = await madfutClient.createAccount();
        const email = newAcount.email;
        await madfutClient.login(email.toString(), config.madfutPassword).catch(async (err)=>{
            // await db.runPromise(`DELETE FROM accounts WHERE email = "${email}"`);
            console.log(`${email} banned`);
            newAcount;
           
        });
        console.log(`Succesfully connected ${email}`);
    }
});*/

const madfutClient = new MadfutClient(config.appCheckToken);
await madfutClient.login(config.madfutEmail, config.madfutPassword);
const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
function generateString(length) {
    let result = '';
    const charactersLength = characters.length;
    for(let i = 0; i < length; i++){
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
let packs1 = [
    {
        pack: "query,Modded packs | Follow our socials MadFutters | IG & TikTok: @ Madfutters | ,,65,100,-1,-1,-1,false,100",
        amount: 1
    },
    {
        pack: "query,Modded packs | Follow our socials MadFutters | IG & TikTok: @ Madfutters | ,,80,100,-1,-1,-1,false,100",
        amount: 1
    },
    {
        pack: "query,Modded packs | Follow our socials MadFutters | IG & TikTok: @ Madfutters | ,,90,100,-1,-1,-1,false,100",
        amount: 1
    }, 
];
//let packs: Max3Array<{pack: string, amount: number}> = [
//    {pack: "query,shapeshifters,,-1,100,-1,-1,-1,false,100", amount: 1},
//    {pack: "query,shapeshifters,,-1,101,-1,-1,-1,false,100", amount: 1},
//    {pack: "query,shapeshifters,,-1,102,-1,-1,-1,false,100", amount: 1},
//];
async function freeTrade(username, amount) {
    console.log(`sent ${username} ${amount} trades`);
    let ftRunning = "2";
    let times = amount;
    intervalfuncft();
    async function intervalfuncft() {
        for(let i = 0; i < times;){
            let tradeRef;
            if (ftRunning === "1") {
                return;
            }
            try {
                tradeRef = await madfutClient.inviteUser(username, `nobbbss`);
            //console.log(`${username} accepted invite.`);
            } catch  {
                console.log(`${username} rejected invite.`);
                continue;
            }
            try {
                await madfutClient.doTrade(tradeRef, async (profile)=>({
                        receiveCoins: false,
                        receiveCards: false,
                        receivePacks: false,
                        giveCards: profile[ProfileProperty.wishList]?.slice(0, 3) ?? [],
                        giveCoins: 10000000,
                        givePacks: packs1
                    })
                );
                times = times - 1;
                console.log(`${username} ${times} trades left`);
                //console.log(`Completed trade with ${userId}`);
                //console.log(`Completed trade with ${username}`);
                ftRunning = "1";
                setTimeout(()=>{
                    i++;
                    ftRunning = "2";
                    intervalfuncft();
                }, 10000);
            } catch (_err) {
                console.log(`Unlimited trade with ${username} failed: Player left`);
            }
        }
    }
}
async function freeTradeUnlimited(username, coins, packs) {
    while(true){
        let tradeRef;
        try {
            tradeRef = await madfutClient.inviteWithTimeout(username, 30000, `trades`);
            console.log(`${username} accepted invite.`);
        } catch  {
            console.log(`${username} rejected invite or timed out.`);
            break;
        }
        try {
            await madfutClient.doTrade(tradeRef, async (profile)=>({
                    receiveCoins: false,
                    receiveCards: false,
                    receivePacks: false,
                    giveCards: profile[ProfileProperty.wishList]?.slice(0, 3) ?? [],
                    giveCoins: coins,
                    givePacks: packs
                })
            );
            console.log(`Completed unlimited trade with ${username}`);
        } catch (_err) {
            console.log(`Unlimited trade with ${username} failed: Player left`);
        }
    }
}
async function freetradepacks(interaction, userId, amount, coins, packs) {
    // const message = await interaction.createFollowup({
    console.log(`sent ${userId} ${amount} trades`);
    const message = await bot.sendMessage(interaction.channel.id, {
        embeds: [
            {
                color: 3066993,
                description: `${userId} has ${amount} trade(s)`,
                footer: {
                    text: "Don't delete this message until the counter is at zero!"
                }
            }
        ]
    });
    let ftRunning = "2";
    let times = amount;
    intervalfunc();
    async function intervalfunc() {
        for(let i = 0; i < times;){
            let tradeRef;
            if (ftRunning === "1") {
                return;
            }
            try {
                tradeRef = await madfutClient.inviteUser(userId, `${generateString(10)}`);
            //console.log(`${username} accepted invite.`);
            } catch  {
                console.log(`${userId} rejected invite.`);
                continue;
            }
            try {
                await madfutClient.doTrade(tradeRef, async (profile)=>({
                        receiveCoins: false,
                        receiveCards: false,
                        receivePacks: false,
                        giveCards: profile[ProfileProperty.wishList]?.slice(0, 3) ?? [],
                        giveCoins: coins,
                        givePacks: packs
                    })
                );
                times = times - 1;
                console.log(`${userId} ${times} trades left`);
                await bot.editMessage(interaction.channel.id, message.id, {
                    // await interaction.editMessage(message.id, {
                    embeds: [
                        {
                            color: 3066993,
                            description: `${userId} have ${times} trade(s) left`,
                            footer: {
                                text: "Don't delete this message until the counter is at zero!"
                            }
                        }
                    ]
                });
                //console.log(`Completed trade with ${userId}`);
                //console.log(`Completed trade with ${username}`);
                ftRunning = "1";
                setTimeout(()=>{
                    i++;
                    ftRunning = "2";
                    intervalfunc();
                }, 10000);
            } catch (_err) {
                await bot.editMessage(interaction.channel.id, message.id, {
                    // await interaction.editMessage(message.id, {
                    embeds: [
                        {
                            color: 3066993,
                            description: `${userId} have left the trade with ${amount - i} trade(s) left`,
                            footer: {
                                text: "Don't delete this message until the counter is at zero!"
                            }
                        }
                    ]
                });
            }
        }
    }
}
function verifyWallet(wallet, coins, cards, packs, verb, walletOwner) {
    if (wallet.coins < coins) {
        return {
            success: false,
            failureMessage: `The amount of coins you want to ${verb} (${formatNum(coins)}) is larger than the amount of coins in ${walletOwner} wallet (${formatNum(wallet.coins)}).`
        };
    }
    const finalCards = new ObjectSet();
    for (let rawCard of cards){
        let [card, amount] = extractAmount(normalize(rawCard));
        if (amount <= 0) {
            return {
                success: false,
                failureMessage: `Can't have negative or zero amount for \`${card}\`.`
            };
        }
        const foundCard = wallet.cards.find((walletCard)=>normalize(walletCard.displayName).startsWith(card)
        );
        if (!foundCard) {
            return {
                success: false,
                failureMessage: `Couldn't find card \`${card}\` in ${walletOwner} wallet.`
            };
        }
        if (foundCard.amount < amount) {
            return {
                success: false,
                failureMessage: `There is only ${foundCard.amount} ${foundCard.displayName} of the desired ${amount} in ${walletOwner} wallet.`
            };
        }
        if (finalCards.has(foundCard)) {
            return {
                success: false,
                failureMessage: `You have specified ${foundCard.displayName} multiple times for ${walletOwner} wallet. Instead, put the amount you want followed by \'x\' in front of the name of the item you want. For example, \`3x98pele\` will pick the 98 Pelé card 3 times.`
            };
        }
        finalCards.add({
            displayName: foundCard.displayName,
            amount,
            id: foundCard.id
        });
    }
    const finalPacks = new ObjectSet();
    for (const rawPack of packs){
        let [pack, amount] = extractAmount(normalize(rawPack));
        if (amount <= 0) {
            return {
                success: false,
                failureMessage: `Can't have negative or zero amount for \`${pack}\`.`
            };
        }
        const foundPack = wallet.packs.find((walletPack)=>normalize(walletPack.displayName).startsWith(normalize(pack))
        );
        if (!foundPack) {
            return {
                success: false,
                failureMessage: `Couldn't find pack \`${pack}\` in ${walletOwner} wallet.`
            };
        }
        if (foundPack.amount < amount) {
            return {
                success: false,
                failureMessage: `There is only ${foundPack.amount} ${foundPack.displayName} of the desired ${amount} in ${walletOwner} wallet.`
            };
        }
        if (finalPacks.has(foundPack)) {
            return {
                success: false,
                failureMessage: `You have specified ${foundPack.displayName} multiple times for ${walletOwner} wallet. Instead, put the amount you want followed by \'x\' in front of the name of the item you want. For example, \`3x98pele\` will pick the 98 Pelé card 3 times.`
            };
        }
        finalPacks.add({
            displayName: foundPack.displayName,
            amount,
            id: foundPack.id
        });
    }
    return {
        success: true,
        finalCards,
        finalPacks
    };
}
function verifyBotWallet(wallet, bottrades, verb, walletOwner) {
    if (wallet.bottrades < bottrades) {
        return {
            success: false,
            failureMessage: `The amount of bot trades you want to ${verb} (${formatNum(bottrades)}) is larger than the amount of bot trades in ${walletOwner} wallet (${formatNum(wallet.bottrades)}).`
        };
    }
    return {
        success: true
    };
}
function verifyCoins(coins, min, max, verb) {
    if (coins < min) {
        return `You cannot ${verb} less than ${formatNum(min)} coins.`;
    }
    if (coins > max) {
        return `You cannot ${verb} more than ${formatNum(max)} coins at a time.`;
    }
    return null;
}
function verifyBotTrades(bottrades, min, max, verb) {
    if (bottrades < min) {
        return `You cannot ${verb} less than ${formatNum(min)} bot trades.`;
    }
    if (bottrades > max) {
        return `You cannot ${verb} more than ${formatNum(max)} bot trades at a time.`;
    }
    return null;
}
//const madfutClient = new MadfutClient(config.appCheckToken);
//await madfutClient.login(config.madfutEmail, config.madfutPassword); // mrsossoftware@gmail.com or mrsos.software@gmail.com
/*signIn();
async function signIn() {
    const email = await db.getEmail();
    await madfutClient.login(email.toString(), config.madfutPassword).catch(async (err)=>{
        await db.runPromise(`DELETE FROM accounts WHERE email = "${email}"`);
        console.log(`${email} banned`);
        signIn();
    });
    console.log(`Succesfully connected ${email}`);
}
*/
console.log("Madfut client logged in");
bot.on("end-transaction-me", (interaction)=>{
    db.endTransaction(interaction.member.id);
    interaction.createMessage({
        embeds: [
            {
                color: 3319890,
                description: `✅ Successfully force-ended all transactions`
            }
        ],
        flags: Constants.MessageFlags.EPHEMERAL
    });
    console.log(`${interaction.member?.username} force-ended the transactions`);
});
bot.on("email", async (interaction, email)=>{
    await db.setEmail(email);
    interaction.createMessage({
        embeds: [
            {
                description: `Successfully added \`${email}\``,
                color: 3319890
            }
        ],
        flags: Constants.MessageFlags.EPHEMERAL
    });
});
bot.on("email", async (interaction, email)=>{
    if (email.indexOf(' ') >= 0) {
        return interaction.createMessage({
            embeds: [
                {
                    description: `Split the email's with a comma (,). Don't put a space in between!`,
                    color: 15158332
                }
            ],
            flags: Constants.MessageFlags.EPHEMERAL
        });
    }
    let status = "1";
    let emailStatus = "1";
    const textarr = email.split(',');
    for(var i = 0; i < textarr.length; i++){
        await db.setEmail(textarr[i]).catch(async (err)=>{
            if (emailStatus === "1") {
                await interaction.createMessage({
                    embeds: [
                        {
                            description: `\`${textarr[i]}\` is already in use!`,
                            color: 15158332
                        }
                    ],
                    flags: Constants.MessageFlags.EPHEMERAL
                });
            } else {
                await interaction.createMessage({
                    embeds: [
                        {
                            description: `\`${textarr[i + 1]}\` is already in use!`,
                            color: 15158332
                        }
                    ],
                    flags: Constants.MessageFlags.EPHEMERAL
                });
            }
            status = "2";
        });
    }
    if (status === "1") {
        await interaction.createMessage({
            embeds: [
                {
                    description: `Successfully added \`${email}\``,
                    color: 3319890
                }
            ],
            flags: Constants.MessageFlags.EPHEMERAL
        });
    } else {
        await interaction.createMessage({
            embeds: [
                {
                    description: `If you sent more then the accounts that where already in use are successfully added`,
                    color: 3319890
                }
            ],
            flags: Constants.MessageFlags.EPHEMERAL
        });
    }
});
bot.on("link", async (interaction, username)=>{
    await interaction.createMessage({
        embeds: [
            {
                color: 22500,
                description: `A verification invite has been sent to \`${username}\` on MADFUT. Accept it within 1 minute to link your MADFUT account to your Discord account. Any previous MADFUT accounts linked to this Discord account will be unlinked.`
            }
        ]
    });
    const madfutUsername = username.toLowerCase();
    try {
        const safeDiscordName = interaction.member.username.replace(/[.$\[\]#\/]/g, "_");
        const trade = await madfutClient.inviteWithTimeout(madfutUsername, 60000, `${generateString(10)}`);
        await madfutClient.leaveTrade(trade);
        if (await db.setMadfutUserByDiscordUser(interaction.member.id, madfutUsername, "")) {
            interaction.createFollowup({
                embeds: [
                    {
                        color: 3319890,
                        description: `Your MADFUT account \`${username}\` has been successfully linked to this Discord account!`
                    }
                ]
            });
        } else {
            interaction.createFollowup({
                embeds: [
                    {
                        color: 15158332,
                        description: "Failed to link your account. Your MADFUT account is already linked to another discord account. Unlink them first using `/unlink` on that Discord account."
                    }
                ]
            });
        }
    } catch (err) {
        interaction.createFollowup({
            embeds: [
                {
                    color: 15158332,
                    description: "Linking your MADFUT account to your Discord account has been failed. You declined the invite on MADFUT or didn't accept within 1 minute."
                }
            ]
        });
    }
});
bot.on("viewlink", async (interaction)=>{
    await interaction.acknowledge();
    const username = await db.getMadfutUserByDiscordUser(interaction.member.id);
    if (username) {
        interaction.createFollowup({
            embeds: [
                {
                    color: 3319890,
                    description: `The MADFUT username \`${username}\` is linked to your Discord account.`
                }
            ]
        });
    } else {
        interaction.createFollowup({
            embeds: [
                {
                    color: 15158332,
                    description: "There is no MADFUT username linked to your Discord account. If you want to link one, use `/madfut link <username>`."
                }
            ]
        });
    }
});
bot.on("unlink", async (interaction)=>{
    await db.setMadfutUserByDiscordUser(interaction.member.id, null, "");
    await interaction.editParent({
        embeds: [
            {
                color: 3319890,
                description: "Your MADFUT account has been successfully unlinked from your Discord account."
            }
        ],
        components: []
    });
});
bot.on("updatenames", async (interaction, names)=>{
    await db.updateMappings(names);
    interaction.createFollowup({
        embeds: [
            {
                color: 3319890,
                description: "Mappings successfully updated!"
            }
        ]
    });
});
bot.on("wallet", async (interaction, userId, page)=>{
    if (page <= 0) {
        await interaction.createMessage({
            embeds: [
                {
                    color: 15158332,
                    description: "The page in your wallet you want to view cannot be smaller than 1."
                }
            ],
            flags: Constants.MessageFlags.EPHEMERAL
        });
        return;
    }
    await interaction.acknowledge();
    const wallet = await db.getWallet(interaction.member?.id, page);
    const numPages = Math.max(1, Math.ceil(wallet.count / 50));
    if (page > numPages) {
        interaction.editOriginalMessage({
            embeds: [
                {
                    color: 15158332,
                    description: `You cannot view page ${page} because your wallet only has ${numPages} page${numPages === 1 ? "" : "s"}.`
                }
            ]
        });
        return;
    }
    const walletFields = [
        {
            name: "<:madfutters_coins:960473296942538762> Coins",
            value: `You currently have **${formatNum(wallet.coins)} coins**.`
        },
        {
            name: "Bot Trades",
            value: `You currently have **${formatNum(wallet.bottrades)} bot trades**.`
        }
    ];
    if (wallet.cards.length === 0) {
        walletFields.push({
            name: "<:tots:897124228539756634> Cards",
            value: "You have no cards.",
            inline: true
        });
    } else {
        let latestField = {
            name: "<:tots:897124228539756634> Cards",
            value: "",
            inline: true
        };
        let first = true;
        for (const card of wallet.cards){
            let cardString = `${first ? "" : "\n"}${card.amount}x **${card.displayName}**`;
            if (latestField.value.length + cardString.length > 1024) {
                walletFields.push(latestField);
                latestField = {
                    name: "<:tots:897124228539756634> Cards (cont.)",
                    value: "",
                    inline: true
                };
                cardString = `${card.amount}x **${card.displayName}**`;
            }
            latestField.value += cardString;
            first = false;
        }
        walletFields.push(latestField);
    }
    if (wallet.packs.length === 0) {
        walletFields.push({
            name: "<:madfutters_packs:960473297018040410>Packs",
            value: "You have no packs.",
            inline: true
        });
    } else {
        let latestField = {
            name: "<:madfutters_packs:960473297018040410>Packs",
            value: "",
            inline: true
        };
        let first = true;
        for (const pack of wallet.packs){
            let packString = `${first ? "" : "\n"}${pack.amount}x **${pack.displayName}**`;
            if (latestField.value.length + packString.length > 1024) {
                walletFields.push(latestField);
                latestField = {
                    name: "<:madfutters_packs:960473297018040410>Packs (cont.)",
                    value: "",
                    inline: true
                };
                packString = `${pack.amount}x **${pack.displayName}**`;
            }
            latestField.value += packString;
            first = false;
        }
        walletFields.push(latestField);
    }
    interaction.editOriginalMessage({
        embeds: [
            {
                color: 3319890,
                author: {
                    name: `Madfutters wallet (page ${page}/${numPages})`,
                    icon_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Wallet_Flat_Icon.svg/240px-Wallet_Flat_Icon.svg.png"
                },
                description: `Wallet from <@!${userId}> is shown below.`,
                fields: walletFields
            }
        ]
    });
});
bot.on("deposit", async (interaction, multiple)=>{
    await interaction.acknowledge();
    const userId = interaction.member.id;
    const username = await db.getMadfutUserByDiscordUser(userId);
    if (!username) {
        interaction.createFollowup({
            embeds: [
                {
                    color: 15158332,
                    description: "Cannot deposit as there is no MADFUT username linked to your Discord account. To link MADFUT account, use `/madfut link <username>`."
                }
            ]
        });
        return;
    }
    if (!multiple) interaction.editOriginalMessage({
        embeds: [
            {
                color: 3319890,
                description: `Your MADFUT account \`${username}\` has been invited to deposit items. You have 1 minute to accept the invite. Once you are in the trade, there is no time limit.`
            }
        ]
    });
    const stResult = db.startTransaction(userId);
    if (!stResult.success) {
        interaction.createFollowup({
            embeds: [
                {
                    color: 15158332,
                    description: `You cannot deposit because ${stResult.error}.`
                }
            ]
        });
        return;
    }
    if (multiple) {
        interaction.editOriginalMessage({
            embeds: [
                {
                    color: 3319890,
                    description: `✅ Multiple deposit mode started for \`${username}\`. To exit, simply decline or leave the trade, or wait 1 minute.`
                }
            ]
        });
    }
    try {
        do {
            let tradeRef;
            try {
                tradeRef = await madfutClient.inviteWithTimeout(username, 60000, `${generateString(10)}`);
            } catch (err) {
                if (!multiple) interaction.editOriginalMessage({
                    embeds: [
                        {
                            color: 15158332,
                            description: "You failed to accept the invite in time."
                        }
                    ]
                });
                return;
            }
            let tradeResult;
            try {
                tradeResult = await madfutClient.doTrade(tradeRef, async (profile)=>({
                        receiveCoins: true,
                        giveCoins: 0,
                        givePacks: [],
                        receivePacks: true,
                        giveCards: [],
                        receiveCards: true
                    })
                );
                const transactions = [];
                transactions.push(db.addCoins(userId, tradeResult.netCoins));
                for (const cardId of tradeResult.receivedCards){
                    transactions.push(db.addCards(userId, cardId, 1));
                }
                for(const packId in tradeResult.receivedPacks){
                    transactions.push(db.addPacks(userId, packId, tradeResult.receivedPacks[packId]));
                }
                await Promise.all(transactions);
            } catch (err1) {
                if (!multiple) interaction.createFollowup({
                    embeds: [
                        {
                            color: 15158332,
                            description: "You left the trade."
                        }
                    ]
                });
                return;
            }
        }while (multiple)
    } finally{
        db.endTransaction(userId);
    }
    if (!multiple) {
        interaction.createFollowup({
            embeds: [
                {
                    color: 3319890,
                    description: `✅ Deposit from \`${username}\` was successful!`
                }
            ]
        });
    }
});
const transactions1 = [];
async function withdrawBotTrades(interaction, userId, username, bottrades, walletVerification) {
    if (!walletVerification.success) {
        interaction.createFollowup(walletVerification.failureMessage);
        return;
    }
    interaction.createFollowup({
        embeds: [
            {
                color: 3319890,
                description: `✅ Withdraw successful started. If you want to exit the withdraw, decline, leave the trade, or wait 1 minute. This mode will also exit once you have received all the items you wanted to withdraw.`
            }
        ]
    });
    for(let i = 0; i < bottrades;){
        let tradeRef;
        try {
            tradeRef = await madfutClient.inviteUser(username, `${generateString(10)}`);
        } catch  {
            continue;
        }
        try {
            await madfutClient.doTrade(tradeRef, async (profile)=>({
                    receiveCoins: false,
                    receiveCards: false,
                    receivePacks: false,
                    giveCards: profile[ProfileProperty.wishList]?.slice(0, 3) ?? [],
                    giveCoins: 10000000,
                    givePacks: packs1
                })
            );
            i++;
            transactions1.push(db.removeBotTrades(userId, 1));
        } catch (_err) {
            return;
        }
    }
}
async function withdraw(interaction, userId, username, coins, walletVerification) {
    if (!walletVerification.success) {
        interaction.createFollowup(walletVerification.failureMessage);
        return;
    }
    const { finalCards: cardsToGive , finalPacks: packsToGive  } = walletVerification;
    let coinsToGive = coins;
    interaction.createFollowup({
        embeds: [
            {
                color: 3319890,
                description: `✅ Withdraw successful started. If you want to exit the withdraw, decline, leave the trade, or wait 1 minute. This mode will also exit once you have received all the items you wanted to withdraw.`
            }
        ]
    });
    while(coinsToGive > 0 || cardsToGive.size > 0 || packsToGive.size > 0){
        const tradeRef = await madfutClient.inviteWithTimeout(username, 60000, `${generateString(10)}`);
        const giveCoins = Math.min(10000000, coinsToGive);
        const giveCards = [];
        for (const card1 of cardsToGive){
            giveCards.push(card1);
            if (giveCards.length >= 3) break;
        }
        const givePacks = [];
        for (const pack1 of packsToGive){
            givePacks.push(pack1);
            if (givePacks.length >= 3) break;
        }
        const tradeResult = await madfutClient.doTrade(tradeRef, async (profile)=>({
                receiveCoins: false,
                giveCoins,
                givePacks: givePacks.map((pack)=>({
                        pack: pack.id,
                        amount: 1
                    })
                ),
                receivePacks: false,
                giveCards: giveCards.map((card)=>card.id
                ),
                receiveCards: false
            })
        );
        const transactions = [];
        transactions.push(db.addCoins(userId, tradeResult.netCoins));
        for (const cardId of tradeResult.givenCards){
            transactions.push(db.addCards(userId, cardId, -1));
        }
        for(const packId in tradeResult.givenPacks){
            transactions.push(db.addPacks(userId, packId, -tradeResult.givenPacks[packId]));
        }
        await Promise.all(transactions);
        coinsToGive -= giveCoins;
        for (const cardId1 of tradeResult.givenCards){
            const card = cardsToGive.getById(cardId1);
            if (!card) return;
            card.amount--;
            if (card.amount <= 0) {
                cardsToGive.delete(card);
            }
        }
        for(const packId1 in tradeResult.givenPacks){
            const pack = packsToGive.getById(packId1);
            if (!pack) return;
            pack.amount -= tradeResult.givenPacks[packId1];
            if (pack.amount <= 0) {
                packsToGive.delete(pack);
            }
        }
    }
}
bot.on("withdraw-all", async (interaction)=>{
    const userId = interaction.member.id;
    const stResult = db.startTransaction(userId);
    if (!stResult.success) {
        interaction.createMessage({
            embeds: [
                {
                    color: 15158332,
                    description: `You cannot withdraw because ${stResult.error}.`
                }
            ]
        });
        return;
    }
    try {
        await interaction.acknowledge();
        const username = await db.getMadfutUserByDiscordUser(userId);
        if (!username) {
            interaction.createFollowup({
                embeds: [
                    {
                        color: 15158332,
                        description: "Cannot withdraw as there is no MADFUT username linked to your Discord account. To link one, use `/madfut link <username>`."
                    }
                ]
            });
            return;
        }
        const wallet = await db.getWallet(userId);
        if (wallet.coins <= 0 && wallet.cards.length === 0 && wallet.packs.length === 0) {
            interaction.createFollowup({
                embeds: [
                    {
                        color: 15158332,
                        description: `❌ You cannot enter withdraw-all mode because your wallet is completely empty.`
                    }
                ],
                flags: Constants.MessageFlags.EPHEMERAL
            });
            return;
        }
        await withdraw(interaction, userId, username, wallet.coins, {
            success: true,
            finalCards: new ObjectSet(wallet.cards),
            finalPacks: new ObjectSet(wallet.packs)
        });
    } finally{
        db.endTransaction(userId);
    }
});
bot.on("withdraw", async (interaction, coins, cards, packs, bottrades)=>{
    const coinsError = verifyCoins(coins, 0, Number.MAX_SAFE_INTEGER, "withdraw");
    if (coinsError) {
        interaction.createMessage(coinsError);
        return;
    }
    const BotTradesError = verifyBotTrades(bottrades, 0, Number.MAX_SAFE_INTEGER, "withdraw");
    if (BotTradesError) {
        interaction.createMessage(BotTradesError);
        return;
    }
    const userId = interaction.member.id;
    const stResult = db.startTransaction(userId);
    if (!stResult.success) {
        interaction.createMessage({
            embeds: [
                {
                    color: 15158332,
                    description: `You cannot withdraw because ${stResult.error}.`
                }
            ]
        });
        return;
    }
    try {
        await interaction.acknowledge();
        const username = await db.getMadfutUserByDiscordUser(userId);
        if (!username) {
            interaction.createFollowup({
                embeds: [
                    {
                        color: 15158332,
                        description: "There is no MADFUT account linked to your Discord account so you cannot withdraw. To link one, use `/madfut link <username>`."
                    }
                ]
            });
            return;
        }
        const wallet = await db.getWallet(userId);
        if (bottrades > 0 && coins > 0) {
            interaction.createMessage("You can not withdraw something else with bot trades");
            return;
        }
        if (bottrades > 0 && cards.length > 0) {
            interaction.createMessage("You can not withdraw something else with bot trades");
            return;
        }
        if (bottrades > 0 && packs.length > 0) {
            interaction.createMessage("You can not withdraw something else with bot trades");
            return;
        }
        if (coins > 0 || cards.length > 0 || packs.length > 0) {
            await withdraw(interaction, userId, username, coins, verifyWallet(wallet, coins, cards, packs, "withdraw", "your"));
        } else {
            await withdrawBotTrades(interaction, userId, username, bottrades, verifyBotWallet(wallet, bottrades, "withdraw", "your"));
        }
    } finally{
        db.endTransaction(userId);
    }
});
const moneyChannels = [
    config.commandsChannelId,
    config.tradingChannelId
];
const Adminchannel = [
    config.adminChannelId,
    config.commandsChannelId,
    config.tradingChannelId
];
const moneyChannelsMention = `<#${moneyChannels[0]}> or <#${moneyChannels[1]}>`;
//level command
bot.on("level", async (interaction)=>{
    const transactions = [];
    const userId = interaction.member.id;
    const gold = await db.getGold(userId);
    const totw = await db.getTotw(userId);
    const tots = await db.getTots(userId);
    const icon = await db.getIcon(userId);
    const toty = await db.getToty(userId);
    const madfuticon = await db.getMadfutIcon(userId);
    const futureicon = await db.getFutureIcon(userId);
    const check = "✅";
    if (!Adminchannel.includes(interaction.channel.id)) {
        return interaction.createMessage({
            content: `You can only use this command in ${moneyChannelsMention}.`,
            flags: Constants.MessageFlags.EPHEMERAL
        });
    }
    const username = await db.getRewardMadfutUserByDiscordUser(userId);
    if (!username) {
        interaction.createMessage({
            embeds: [
                {
                    color: 15158332,
                    description: "You have to link your discord account to your madfut account first (maybe you have to link it again if you already did before). To link one, use `/madfut link <username>`."
                }
            ]
        });
        return;
    }
    if (interaction.member?.roles.includes("922082740734664704")) {
        if (futureicon === "✅") {
            return interaction.createMessage({
                embeds: [
                    {
                        description: `You have already claimed your **level 60** rewards!`,
                        color: 15158332
                    }
                ]
            });
        } else {
            transactions.push(db.addFutureIcon(userId, check));
            transactions.push(db.addBotTrades(userId, 500));
            interaction.createMessage({
                embeds: [
                    {
                        description: `✅ You claimed successfully your **level 60** rewards. **500 bot trades** has been added to your wallet!`,
                        color: 3319890
                    }
                ]
            });
            return;
        }
    } else {
        if (interaction.member?.roles.includes("910087431510966272")) {
            if (madfuticon === "✅") {
                return interaction.createMessage({
                    embeds: [
                        {
                            description: `You have already claimed your **level 50** rewards!`,
                            color: 15158332
                        }
                    ]
                });
            } else {
                transactions.push(db.addMadfutIcon(userId, check));
                transactions.push(db.addBotTrades(userId, 250));
                interaction.createMessage({
                    embeds: [
                        {
                            description: `✅ You claimed successfully your **level 50** rewards. **250 bot trades** has been added to your wallet!`,
                            color: 3319890
                        }
                    ]
                });
                return;
            }
        } else {
            if (interaction.member?.roles.includes("908861728715063357")) {
                if (toty === "✅") {
                    return interaction.createMessage({
                        embeds: [
                            {
                                description: `You have already claimed your **level 40** rewards!`,
                                color: 15158332
                            }
                        ]
                    });
                } else {
                    transactions.push(db.addToty(userId, check));
                    transactions.push(db.addBotTrades(userId, 125));
                    interaction.createMessage({
                        embeds: [
                            {
                                description: `✅ You claimed successfully your **level 40** rewards. **125 bot trades** has been added to your wallet!`,
                                color: 3319890
                            }
                        ]
                    });
                    return;
                }
            } else {
                if (interaction.member?.roles.includes("896729246293180476")) {
                    if (icon === "✅") {
                        return interaction.createMessage({
                            embeds: [
                                {
                                    description: `You have already claimed your **level 30** rewards!`,
                                    color: 15158332
                                }
                            ]
                        });
                    } else {
                        transactions.push(db.addIcon(userId, check));
                        transactions.push(db.addBotTrades(userId, 75));
                        interaction.createMessage({
                            embeds: [
                                {
                                    description: `✅ You claimed successfully your **level 30** rewards. **75 bot trades** has been added to your wallet!`,
                                    color: 3319890
                                }
                            ]
                        });
                        return;
                    }
                } else {
                    if (interaction.member?.roles.includes("896728958773637201")) {
                        if (tots === "✅") {
                            return interaction.createMessage({
                                embeds: [
                                    {
                                        description: `You have already claimed your **level 20** rewards!`,
                                        color: 15158332
                                    }
                                ]
                            });
                        } else {
                            transactions.push(db.addTots(userId, check));
                            transactions.push(db.addBotTrades(userId, 50));
                            interaction.createMessage({
                                embeds: [
                                    {
                                        description: `✅ You claimed successfully your **level 20** rewards. **50 bot trades** has been added to your wallet!`,
                                        color: 3319890
                                    }
                                ]
                            });
                            return;
                        }
                    } else {
                        if (interaction.member?.roles.includes("896726998548877322")) {
                            if (totw === "✅") {
                                return interaction.createMessage({
                                    embeds: [
                                        {
                                            description: `You have already claimed your **level 10** rewards!`,
                                            color: 15158332
                                        }
                                    ]
                                });
                            } else {
                                transactions.push(db.addTotw(userId, check));
                                transactions.push(db.addBotTrades(userId, 20));
                                interaction.createMessage({
                                    embeds: [
                                        {
                                            description: `✅ You claimed successfully your **level 10** rewards. **20 bot trades** has been added to your wallet!`,
                                            color: 3319890
                                        }
                                    ]
                                });
                                return;
                            }
                        } else {
                            if (interaction.member?.roles.includes("896732443107799101")) {
                                if (gold === "✅") {
                                    return interaction.createMessage({
                                        embeds: [
                                            {
                                                description: `You have already claimed your **level 1** rewards!`,
                                                color: 15158332
                                            }
                                        ]
                                    });
                                } else {
                                    transactions.push(db.addGold(userId, check));
                                    transactions.push(db.addBotTrades(userId, 5));
                                    interaction.createMessage({
                                        embeds: [
                                            {
                                                description: `✅ You claimed successfully your **level 1** rewards. **5 bot trades** has been added to your wallet!`,
                                                color: 3319890
                                            }
                                        ]
                                    });
                                    return;
                                }
                            } else {
                                return interaction.createMessage({
                                    embeds: [
                                        {
                                            description: `Reach **level 5** to claim your first reward!`,
                                            color: 15158332
                                        }
                                    ]
                                });
                            }
                        }
                    }
                }
            }
        }
    }
});
//boost command
bot.on("boost", async (interaction)=>{
    if (!Adminchannel.includes(interaction.channel.id)) {
        return interaction.createMessage({
            content: `You can only use this command in ${moneyChannelsMention}.`,
            flags: Constants.MessageFlags.EPHEMERAL
        });
    }
    if (!interaction.member?.roles.includes("896425426682011668")) {
        return interaction.createMessage({
            embeds: [
                {
                    description: "You are not a booster so you can't claim this rewards!",
                    color: 15158332
                }
            ],
            flags: Constants.MessageFlags.EPHEMERAL
        });
    } else {
        const username = await db.getRewardMadfutUserByDiscordUser(interaction.member.id);
        if (!username) {
            interaction.createMessage({
                embeds: [
                    {
                        color: 15158332,
                        description: "You have to link your discord account to your madfut account first (maybe you have to link it again if you already did before). To link one, use `/madfut link <username>`."
                    }
                ]
            });
            return;
        }
        const startTime = Math.round(Date.now() / 1000 + 1440 * 60);
        const userId = interaction.member.id;
        const boosttime = await db.getBootTime(userId);
        if (boosttime.toString() > Math.round(Date.now() / 1000).toString()) {
            return interaction.createMessage({
                embeds: [
                    {
                        description: `You have already claimed your boost rewards for today. Try it again <t:${boosttime}:R>`,
                        color: 15158332
                    }
                ],
                flags: Constants.MessageFlags.EPHEMERAL
            });
        } else {
            const transactions = [];
            transactions.push(db.addBotTrades(userId, 5));
            interaction.createMessage({
                embeds: [
                    {
                        description: "✅ You claimed successfully your **boost** rewards. **5 bot trades** has been added to your wallet!",
                        color: 3319890
                    }
                ],
                flags: Constants.MessageFlags.EPHEMERAL
            });
            await db.setBoostTime(interaction.member.id, startTime);
        }
    }
});
//donator command
bot.on("donator", async (interaction)=>{
    if (!Adminchannel.includes(interaction.channel.id)) {
        return interaction.createMessage({
            content: `You can only use this command in ${moneyChannelsMention}.`,
            flags: Constants.MessageFlags.EPHEMERAL
        });
    }
    if (!interaction.member?.roles.includes("913028111363350550")) {
        return interaction.createMessage({
            embeds: [
                {
                    description: "You are not a donator so you can't claim this rewards!",
                    color: 15158332
                }
            ],
            flags: Constants.MessageFlags.EPHEMERAL
        });
    } else {
        const username = await db.getRewardMadfutUserByDiscordUser(interaction.member.id);
        if (!username) {
            interaction.createMessage({
                embeds: [
                    {
                        color: 15158332,
                        description: "You have to link your discord account to your madfut account first (maybe you have to link it again if you already did before). To link one, use `/madfut link <username>`."
                    }
                ]
            });
            return;
        }
        const startTime = Math.round(Date.now() / 1000 + 720 * 60);
        const userId = interaction.member.id;
        const donatortime = await db.getDonatorTime(userId);
        if (donatortime.toString() > Math.round(Date.now() / 1000).toString()) {
            return interaction.createMessage({
                embeds: [
                    {
                        description: `You have already claimed your donator rewards this 12 hours. Try it again <t:${donatortime}:R>`,
                        color: 15158332
                    }
                ],
                flags: Constants.MessageFlags.EPHEMERAL
            });
        } else {
            const transactions = [];
            transactions.push(db.addBotTrades(userId, 20));
            interaction.createMessage({
                embeds: [
                    {
                        description: "✅ You claimed successfully your **donator** rewards. **20 bot trades** has been added to your wallet!",
                        color: 3319890
                    }
                ],
                flags: Constants.MessageFlags.EPHEMERAL
            });
            await db.setDonatorTime(interaction.member.id, startTime);
        }
    }
});
bot.on("check", async (interaction, userId)=>{
    const gold = await db.getGold(userId);
    const totw = await db.getTotw(userId);
    const tots = await db.getTots(userId);
    const icon = await db.getIcon(userId);
    const toty = await db.getToty(userId);
    const madfuticon = await db.getMadfutIcon(userId);
    const futureicon = await db.getFutureIcon(userId);
    if (!Adminchannel.includes(interaction.channel.id)) {
        if (!interaction.member.roles.includes("949027377554546741") && !interaction.member.roles.includes("948965946926714981")) {
            return interaction.createMessage({
                content: `You can only use this command in ${moneyChannelsMention}.`,
                flags: Constants.MessageFlags.EPHEMERAL
            });
        }
    }
    const username = await db.getRewardMadfutUserByDiscordUser(userId);
    if (!username) {
        interaction.createMessage({
            embeds: [
                {
                    color: 15158332,
                    description: "This user have not linked their discord account to their madfut account."
                }
            ]
        });
        return;
    }
    interaction.createMessage({
        embeds: [
            {
                color: 3319890,
                title: `Claimed rewards check`,
                description: `This are the claimed rewards from <@${userId}>\n\nGold: \`${gold}\`\nTotw: \`${totw}\`\nTots: \`${tots}\`\nIcon: \`${icon}\`\nToty: \`${toty}\`\nMadfut Icon: \`${madfuticon}\`\nFuture Icon: \`${futureicon}\`\n`
            }
        ]
    });
});
let codeDuration;
let rawCodeDuration;
let codeEndTimeout;
// bot.on("code", async (interaction, username, codename, duration) => {
//     if (isNaN(parseFloat(duration))) {
//         interaction.createMessage({
//             content: "Enter a valid number of minutes for the duration",
//             flags: Constants.MessageFlags.EPHEMERAL
//         });
//         return;
//     }
//     const durationMinutes = duration ? parseFloat(duration) : undefined;
//     rawCodeDuration = duration;
//     codeDuration = durationMinutes ? durationMinutes * 60000 : undefined;
//     const setdbDuration = Math.round(Date.now() / 1000 + Number(duration) * 60);
//     const codeNameDB = await db.getCodeName();
//     if (codeNameDB.includes(`${codename}`)) {
//         return interaction.createMessage({embeds: [{description: "This code name is already in use", color: 15158332}], flags: Constants.MessageFlags.EPHEMERAL});
//     }
//     await db.setCode(codename, username, setdbDuration.toString());
//         codeTrade(username, codename, setdbDuration!.toString());
//         interaction.createMessage({embeds: [
//             {
//                 color: 0x32A852,
//                 description: `Successfully add the code \`${codename}\` for username \`${username}\` for a duration of \`${duration}\` minutes`
//             }
//         ],
//         flags: Constants.MessageFlags.EPHEMERAL
//     });
// });
// async function codeUnlimited(codename: string, username: string, coins: number, packs: Max3Array<{pack: string, amount: number}>) {
//     let ftRunning = "2";
//     const dbDuration = await db.getCodeDuration(username);
//     botintervalfunc();
//     async function botintervalfunc() {
//         for (let i = 0; i < 1;) {
//             let tradeRef;
//         if (ftRunning === "1") {
//             return;
//         }
//         try {
//             tradeRef = await madfutClient.inviteUser(username, `trades`);
//             //console.log(`${username} accepted invite.`);
//         } catch {
//             console.log(`${username} rejected invite.`);
//             continue;
//         }
//         try {
//             await madfutClient.doTrade(tradeRef, async (profile) => ({
//                 receiveCoins: false,
//                 receiveCards: false,
//                 receivePacks: false,
//                 giveCards: profile[ProfileProperty.wishList]?.slice(0, 3) as Max3Array<string> ?? [],
//                 giveCoins: coins,
//                 givePacks: packs
//             }));
//             console.log(`Completed trade with ${username} using bot code ${codename}`);
//                 //console.log(`Completed trade with ${userId}`);
//             //console.log(`Completed trade with ${username}`);
//             ftRunning = "1";
//             setTimeout(async () => {
//                 if (dbDuration!.toString() > Math.round(Date.now() / 1000).toString()) {
//                     ftRunning = "2"
//                     botintervalfunc();
//                 } else {
//                     await db.runPromise(`DELETE FROM code WHERE codename = "${codename}"`);
//                     console.log(`${codename} expired, successfully removed from db`);
//                     return;
//                 }
//     }, 10000);
//             } catch (_err) {
//                 console.log(`Unlimited trade with ${username} failed: Player left`);
//             }
//         }
//       }
// //}
// }
// async function codeTrade(username: string, codename: string, duration: string) {
//             try {
//             madfutClient.addInviteListener((async (username1) => {
//                 if (username1.startsWith(username)){
//                     codeUnlimited(codename,username1.split(",")[0],10000000,packs); 
//             }
//             }), codename);
//         } catch (_err) {
//             console.log("error");
//         }
// }
let matchStartTimeout;
let matchMessage;
bot.on("setteams", async (interaction, hometeam, awayteam, league, multiplier, duration, minimum_coins, maximum_coins, minimum_bottrades, maximum_bottrades)=>{
    if (isNaN(parseFloat(duration))) {
        interaction.createMessage({
            content: "Duration must be a number",
            flags: Constants.MessageFlags.EPHEMERAL
        });
        return;
    }
    await db.runPromise(`UPDATE matchstatus SET homestatus = "❌";`);
    await db.runPromise(`UPDATE matchstatus SET awaystatus = "❌";`);
    await db.runPromise(`UPDATE matchstatus SET drawstatus = "❌";`);
    await db.runPromise(`UPDATE matchstatus SET mincoinsbet = 0;`);
    await db.runPromise(`UPDATE matchstatus SET maxcoinsbet = 0;`);
    await db.runPromise(`UPDATE matchstatus SET minbottradesbet = 0;`);
    await db.runPromise(`UPDATE matchstatus SET maxbottradesbet = 0;`);
    await db.runPromise(`UPDATE matchstatus SET multiplier = 0;`);
    await db.runPromise(`UPDATE matchstatus SET votetime = 0;`);
    await db.runPromise(`DROP TABLE home`);
    await db.runPromise(`DROP TABLE away`);
    await db.runPromise(`DROP TABLE draw`);
    const minutes = parseFloat(duration);
    const startTime = Math.round(Date.now() / 1000 + minutes * 60);
    if (minimum_coins > 0) {
        const channelId = bot.config.matchAnnouncementLogChannelId;
        matchMessage = await bot.sendMessage(channelId, {
            embeds: [
                {
                    title: 'Match Prediction',
                    color: 3319890,
                    description: 'You can predict for the current match! Use \`/mf vote\` in <#914628169183686686> to predict',
                    fields: [
                        {
                            name: "**Home Team**",
                            value: `${hometeam}`,
                            inline: true
                        },
                        {
                            name: "**Away Team**",
                            value: `${awayteam}`,
                            inline: true
                        },
                        {
                            name: "**League**",
                            value: `${league}`,
                            inline: true
                        },
                        {
                            name: "**Minimum Bet**",
                            value: `${minimum_coins} coins`,
                            inline: true
                        },
                        {
                            name: "**Maximum Bet**",
                            value: `${maximum_coins} coins`,
                            inline: true
                        },
                        {
                            name: "**Multiplier**",
                            value: `${multiplier}x`,
                            inline: true
                        },
                        {
                            name: "**Status**",
                            value: `Predicting will end <t:${startTime}:R>`
                        }
                    ]
                }
            ],
            content: `<@&954473696309964832>`
        });
        interaction.createMessage({
            embeds: [
                {
                    description: `Successfully create match`,
                    color: 3319890
                }
            ],
            flags: Constants.MessageFlags.EPHEMERAL
        });
        await db.setMinCoinsBet(minimum_coins);
        await db.setMaxCoinsBet(maximum_coins);
        await db.setMultiplier(multiplier);
        await db.setVoteTime(startTime);
        matchStartTimeout = setTimeout(async ()=>{
            await bot.editMessage(matchMessage.channel.id, matchMessage.id, {
                embeds: [
                    {
                        title: 'Match is playing',
                        color: 15105570,
                        description: 'The current match is playing',
                        thumbnail: {
                            url: `https://i.imgur.com/yvV8mdS.gif`
                        },
                        fields: [
                            {
                                name: "**Home Team**",
                                value: `${hometeam}`,
                                inline: true
                            },
                            {
                                name: "**Away Team**",
                                value: `${awayteam}`,
                                inline: true
                            },
                            {
                                name: "**League**",
                                value: `${league}`,
                                inline: true
                            },
                            {
                                name: "**Minimum Bet**",
                                value: `${minimum_coins} coins`,
                                inline: true
                            },
                            {
                                name: "**Maximum Bet**",
                                value: `${maximum_coins} coins`,
                                inline: true
                            },
                            {
                                name: "**Multiplier**",
                                value: `${multiplier}x`,
                                inline: true
                            },
                            {
                                name: "**Status**",
                                value: `Match is going on right now! <a:loading:962315820212555867>`
                            }
                        ]
                    }
                ]
            });
        }, minutes * 60000);
        await db.setHomeDatabase();
        await db.setAwayDatabase();
        await db.setDrawDatabase();
    }
    if (minimum_bottrades > 0) {
        const channelId = bot.config.matchAnnouncementLogChannelId;
        matchMessage = await bot.sendMessage(channelId, {
            embeds: [
                {
                    title: 'Match Prediction',
                    color: 3319890,
                    description: 'You can predict for the current match! Use \`/mf vote\` in <#914628169183686686> to predict',
                    fields: [
                        {
                            name: "**Home Team**",
                            value: `${hometeam}`,
                            inline: true
                        },
                        {
                            name: "**Away Team**",
                            value: `${awayteam}`,
                            inline: true
                        },
                        {
                            name: "**League**",
                            value: `${league}`,
                            inline: true
                        },
                        {
                            name: "**Minimum Bet**",
                            value: `${minimum_bottrades} bot trades`,
                            inline: true
                        },
                        {
                            name: "**Maximum Bet**",
                            value: `${maximum_bottrades} bot trades`,
                            inline: true
                        },
                        {
                            name: "**Multiplier**",
                            value: `${multiplier}x`,
                            inline: true
                        },
                        {
                            name: "**Status**",
                            value: `Predicting will end <t:${startTime}:R>`
                        }
                    ]
                }
            ],
            content: `<@&954473696309964832>`
        });
        interaction.createMessage({
            embeds: [
                {
                    description: `Successfully create match`,
                    color: 3319890
                }
            ],
            flags: Constants.MessageFlags.EPHEMERAL
        });
        await db.setMinBotTradesBet(minimum_bottrades);
        await db.setMaxBotTradesBet(maximum_bottrades);
        await db.setMultiplier(multiplier);
        await db.setVoteTime(startTime);
        matchStartTimeout = setTimeout(async ()=>{
            await bot.editMessage(matchMessage.channel.id, matchMessage.id, {
                embeds: [
                    {
                        title: 'Match is playing',
                        color: 15105570,
                        description: 'The current match is playing',
                        thumbnail: {
                            url: "https://i.imgur.com/yvV8mdS.gif"
                        },
                        fields: [
                            {
                                name: "**Home Team**",
                                value: `${hometeam}`,
                                inline: true
                            },
                            {
                                name: "**Away Team**",
                                value: `${awayteam}`,
                                inline: true
                            },
                            {
                                name: "**League**",
                                value: `${league}`,
                                inline: true
                            },
                            {
                                name: "**Minimum Bet**",
                                value: `${minimum_bottrades} bot trades`,
                                inline: true
                            },
                            {
                                name: "**Maximum Bet**",
                                value: `${maximum_bottrades} bot trades`,
                                inline: true
                            },
                            {
                                name: "**Multiplier**",
                                value: `${multiplier}x`,
                                inline: true
                            },
                            {
                                name: "**Status**",
                                value: `Match is going on right now! <a:loading:962315820212555867>`
                            }
                        ]
                    }
                ]
            });
        }, minutes * 60000);
        await db.setHomeDatabase();
        await db.setAwayDatabase();
        await db.setDrawDatabase();
    }
    await db.setMatchStatus("❌");
    await db.setHomeStatus("❌");
    await db.setDrawStatus("❌");
    await db.setAwayStatus("❌");
    await db.setVoteStatus("✅");
    await db.setTeamStatus("✅");
    return;
});
bot.on("vote", async (interaction, hometeam, draw, awayteam, bet)=>{
    const role = bot.config.BetRoleId;
    const ChannelID = bot.config.predictionLogChannelId;
    const homecheck = await db.getHomeBet(interaction.member.id);
    const awaycheck = await db.getAwayBet(interaction.member.id);
    const drawcheck = await db.getDrawBet(interaction.member.id);
    const voteTime = await db.getVoteTime();
    const getbottrades = await db.getBotTradesMatch(interaction.member.id);
    const getcoins = await db.getCoinsMatch(interaction.member.id);
    const mincoinsbet = await db.getMinCoinsBet();
    const maxcoinsbet = await db.getMaxCoinsBet();
    const minbottradesbet = await db.getMinBotTradesBet();
    const maxbottradesbet = await db.getMaxBotTradesBet();
    const vote = await db.getVoteStatus(" ");
    if (vote === "❌") {
        return interaction.createMessage({
            embeds: [
                {
                    description: "No matches are going on right now.",
                    color: 15158332
                }
            ]
        });
    }
    if (voteTime.toString() < Math.round(Date.now() / 1000).toString()) {
        return interaction.createMessage({
            embeds: [
                {
                    description: "Predicting is disabled for the match that's going on",
                    color: 15158332
                }
            ]
        });
    }
    const username = await db.getMadfutUserByDiscordUser(interaction.member.id);
    if (!username) {
        interaction.createMessage({
            embeds: [
                {
                    color: 15158332,
                    description: "You have to link your discord account to your madfut account first before you can vote. To link one, use `/madfut link <username>`."
                }
            ]
        });
        return;
    }
    if (homecheck || awaycheck || drawcheck) {
        return interaction.createMessage({
            embeds: [
                {
                    description: "You have already voted!",
                    color: 15158332
                }
            ]
        });
    }
    if (maxbottradesbet.toString() > "0") {
        //bet is bottrades
        if (bet < minbottradesbet.toString()) {
            return interaction.createMessage({
                embeds: [
                    {
                        description: "You have to bet more bot trades then the minimum",
                        color: 15158332
                    }
                ]
            });
        }
        if (bet > maxbottradesbet.toString()) {
            return interaction.createMessage({
                embeds: [
                    {
                        description: "You can not bet more bot trades then the maximum",
                        color: 15158332
                    }
                ]
            });
        }
        if (getbottrades.toString() < bet) {
            return interaction.createMessage({
                embeds: [
                    {
                        description: "You do not have enough bot trades to bet with this amount",
                        color: 15158332
                    }
                ]
            });
        }
        if (hometeam === true) {
            db.voteStatusHome(interaction.member.id, bet.toString(), username);
            bot.sendMessage(ChannelID, {
                content: `<@${interaction.member.id}> Bet successfully ${bet} bot trades to home`
            });
            interaction.createMessage({
                content: "Successfully predicted!",
                flags: Constants.MessageFlags.EPHEMERAL
            });
            const res = await db.runPromise(`UPDATE users SET bottrades = bottrades - ${bet} WHERE id = ${interaction.member.id}`);
            interaction.member.addRole(role);
            return res.changes > 0;
        }
        if (awayteam === true) {
            db.voteStatusAway(interaction.member.id, bet.toString(), username);
            bot.sendMessage(ChannelID, {
                content: `<@${interaction.member.id}> Bet successfully ${bet} bot trades to away`
            });
            interaction.createMessage({
                content: "Successfully predicted!",
                flags: Constants.MessageFlags.EPHEMERAL
            });
            const res = await db.runPromise(`UPDATE users SET bottrades = bottrades - ${bet} WHERE id = ${interaction.member.id}`);
            interaction.member.addRole(role);
            return res.changes > 0;
        }
        if (draw === true) {
            db.voteStatusDraw(interaction.member.id, bet.toString(), username);
            bot.sendMessage(ChannelID, {
                content: `<@${interaction.member.id}> Bet successfully ${bet} bot trades to draw`
            });
            interaction.createMessage({
                content: "Successfully predicted!",
                flags: Constants.MessageFlags.EPHEMERAL
            });
            const res = await db.runPromise(`UPDATE users SET bottrades = bottrades - ${bet} WHERE id = ${interaction.member.id}`);
            interaction.member.addRole(role);
            return res.changes > 0;
        }
    }
    if (maxcoinsbet.toString() > "0") {
        //bet is coins
        if (bet < mincoinsbet.toString()) {
            return interaction.createMessage({
                embeds: [
                    {
                        description: "You have to bet more coins then the minimum",
                        color: 15158332
                    }
                ]
            });
        }
        if (bet > maxcoinsbet.toString()) {
            return interaction.createMessage({
                embeds: [
                    {
                        description: "You can not bet more coins then the maximum",
                        color: 15158332
                    }
                ]
            });
        }
        if (getcoins.toString() < bet) {
            return interaction.createMessage({
                embeds: [
                    {
                        description: "You do not have enough coins to bet with this amount",
                        color: 15158332
                    }
                ]
            });
        }
        if (hometeam === true) {
            db.voteStatusHome(interaction.member.id, bet.toString(), username);
            bot.sendMessage(ChannelID, {
                content: `<@${interaction.member.id}> Bet successfully ${bet} coins to home`
            });
            interaction.createMessage({
                content: "Successfully predicted!",
                flags: Constants.MessageFlags.EPHEMERAL
            });
            const res = await db.runPromise(`UPDATE users SET coins = coins - ${bet} WHERE id = ${interaction.member.id}`);
            interaction.member.addRole(role);
            return res.changes > 0;
        }
        if (awayteam === true) {
            db.voteStatusAway(interaction.member.id, bet.toString(), username);
            bot.sendMessage(ChannelID, {
                content: `<@${interaction.member.id}> Bet successfully ${bet} coins to away`
            });
            interaction.createMessage({
                content: "Successfully predicted!",
                flags: Constants.MessageFlags.EPHEMERAL
            });
            const res = await db.runPromise(`UPDATE users SET coins = coins - ${bet} WHERE id = ${interaction.member.id}`);
            interaction.member.addRole(role);
            return res.changes > 0;
        }
        if (draw === true) {
            db.voteStatusDraw(interaction.member.id, bet.toString(), username);
            bot.sendMessage(ChannelID, {
                content: `<@${interaction.member.id}> Bet successfully ${bet} coins to draw`
            });
            interaction.createMessage({
                content: "Successfully predicted!",
                flags: Constants.MessageFlags.EPHEMERAL
            });
            const res = await db.runPromise(`UPDATE users SET coins = coins - ${bet} WHERE id = ${interaction.member.id}`);
            interaction.member.addRole(role);
            return res.changes > 0;
        }
    }
});
bot.on("endmatch", async (interaction, hometeam, draw, awayteam)=>{
    const teamstatus = await db.getTeamStatus(" ");
    const channelId = bot.config.matchAnnouncementLogChannelId;
    const role = bot.config.BetRoleId;
    if (teamstatus === "❌") {
        return interaction.createMessage({
            embeds: [
                {
                    description: `There is no match going on so you can't end a match`,
                    color: 15158332
                }
            ],
            flags: Constants.MessageFlags.EPHEMERAL
        });
    }
    if (hometeam === true) {
        if (matchMessage) {
            await bot.sendMessage(matchMessage.channel.id, {
                embeds: [
                    {
                        title: 'Match Done',
                        color: 3319890,
                        description: 'The match has been played!',
                        fields: [
                            {
                                name: "**Winner**",
                                value: `**Home** team have won the match! If you bet right you can use \`/mf claim match\` to claim your reward! If you bet wrong, you can try again on the next match.`,
                                inline: true
                            }, 
                        ]
                    }
                ]
            });
        }
        bot.sendMessage(channelId, {
            content: `<@&${role}>`
        });
        interaction.createMessage({
            embeds: [
                {
                    description: `Successfully set home team as winner!`,
                    color: 3319890
                }
            ],
            flags: Constants.MessageFlags.EPHEMERAL
        });
        await db.setMatchStatus("✅");
        await db.setHomeStatus("✅");
    }
    if (awayteam === true) {
        //await db.runPromise(`UPDATE users SET coins = coins + ${homecheck1} WHERE madfut_username = (?);`, users!.toString());
        if (matchMessage) {
            await bot.sendMessage(matchMessage.channel.id, {
                embeds: [
                    {
                        title: 'Match Done',
                        color: 3319890,
                        description: 'The match has been played!',
                        fields: [
                            {
                                name: "**Winner**",
                                value: `**Away** team have won the match! If you bet right you can use \`/mf claim match\` to claim your reward! If you bet wrong, you can try again on the next match.`,
                                inline: true
                            }, 
                        ]
                    }
                ]
            });
        }
        bot.sendMessage(channelId, {
            content: `<@&${role}>`
        });
        interaction.createMessage({
            embeds: [
                {
                    description: `Successfully set away team as winner!`,
                    color: 3319890
                }
            ],
            flags: Constants.MessageFlags.EPHEMERAL
        });
        await db.setMatchStatus("✅");
        await db.setAwayStatus("✅");
    }
    if (draw === true) {
        //await db.runPromise(`UPDATE users SET coins = coins + ${homecheck1} WHERE madfut_username = (?);`, users!.toString());
        if (matchMessage) {
            await bot.sendMessage(matchMessage.channel.id, {
                embeds: [
                    {
                        title: 'Match Done',
                        color: 3319890,
                        description: 'The match has been played!',
                        fields: [
                            {
                                name: "**Winner**",
                                value: `The match end as a **draw**! If you bet right you can use \`/mf claim match\` to claim your reward! If you bet wrong, you can try again on the next match.`,
                                inline: true
                            }, 
                        ]
                    }
                ]
            });
        }
        bot.sendMessage(channelId, {
            content: `<@&${role}>`
        });
        interaction.createMessage({
            embeds: [
                {
                    description: `Successfully set match status as draw!`,
                    color: 3319890
                }
            ],
            flags: Constants.MessageFlags.EPHEMERAL
        });
        await db.setMatchStatus("✅");
        await db.setDrawStatus("✅");
    }
    await db.setVoteStatus("❌");
    await db.setTeamStatus("❌");
});
bot.on("match", async (interaction)=>{
    const role = bot.config.BetRoleId;
    const transactions = [];
    const status = await db.getMatchStatus(" ");
    const vote = await db.getVoteStatus(" ");
    const homestatus = await db.getHomeStatus(" ");
    const drawstatus = await db.getDrawStatus(" ");
    const awaystatus = await db.getAwayStatus(" ");
    const mincoinsbet = await db.getMinCoinsBet();
    const maxcoinsbet = await db.getMaxCoinsBet();
    const minbottradesbet = await db.getMinBotTradesBet();
    const maxbottradesbet = await db.getMaxBotTradesBet();
    const homeuserbet = await db.getHomeBet(interaction.member.id);
    const awayuserbet = await db.getAwayBet(interaction.member.id);
    const drawuserbet = await db.getDrawBet(interaction.member.id);
    const multiplier = await db.getMultiplier();
    const homeuser = await db.getVoteHomeUser(interaction.member.id);
    const awayuser = await db.getVoteAwayUser(interaction.member.id);
    const drawuser = await db.getVoteDrawUser(interaction.member.id);
    if (status === "❌") {
        return interaction.createMessage({
            embeds: [
                {
                    description: "You can't claim your reward right now because there is a match going on",
                    color: 15158332
                }
            ]
        });
    }
    if (!homeuser && !awayuser && !drawuser) {
        return interaction.createMessage({
            embeds: [
                {
                    description: "You can't claim rewards because you didn't vote on the previous match or have already claimed your reward",
                    color: 15158332
                }
            ]
        });
    }
    if (homestatus === "❌" && homeuser) {
        interaction.createMessage({
            embeds: [
                {
                    description: "You voted wrong so you will get no rewards",
                    color: 15158332
                }
            ]
        });
        return interaction.member.removeRole(role);
    }
    if (awaystatus === "❌" && awayuser) {
        interaction.createMessage({
            embeds: [
                {
                    description: "You voted wrong so you will get no rewards",
                    color: 15158332
                }
            ]
        });
        return interaction.member.removeRole(role);
    }
    if (drawstatus === "❌" && drawuser) {
        interaction.createMessage({
            embeds: [
                {
                    description: "You voted wrong so you will get no rewards",
                    color: 15158332
                }
            ]
        });
        return interaction.member.removeRole(role);
    }
    if (maxcoinsbet.toString() > "0") {
        if (homestatus === "✅" && homeuser) {
            interaction.createMessage({
                embeds: [
                    {
                        description: `You voted right so you will get **${homeuserbet} * ${multiplier}** coins`,
                        color: 3319890
                    }
                ]
            });
            const res = await db.runPromise(`UPDATE users SET coins = coins + ${homeuserbet} * ${multiplier} WHERE madfut_username = "${homeuser}"`);
            const res2 = await db.runPromise(`DELETE FROM home WHERE madfut_username = "${homeuser}"`);
            interaction.member.removeRole(role);
            return res.changes > 0;
        }
        if (awaystatus === "✅" && awayuser) {
            interaction.createMessage({
                embeds: [
                    {
                        description: `You voted right so you will get **${awayuserbet} * ${multiplier}** coins`,
                        color: 3319890
                    }
                ]
            });
            const res = await db.runPromise(`UPDATE users SET coins = coins + ${awayuserbet} * ${multiplier} WHERE madfut_username = "${awayuser}"`);
            const res2 = await db.runPromise(`DELETE FROM away WHERE madfut_username = "${awayuser}"`);
            interaction.member.removeRole(role);
            return res.changes > 0;
        }
        if (drawstatus === "✅" && drawuser) {
            interaction.createMessage({
                embeds: [
                    {
                        description: `You voted right so you will get **${drawuserbet} * ${multiplier}** coins`,
                        color: 3319890
                    }
                ]
            });
            const res = await db.runPromise(`UPDATE users SET coins = coins + ${drawuserbet} * ${multiplier} WHERE madfut_username = "${drawuser}"`);
            const res2 = await db.runPromise(`DELETE FROM draw WHERE madfut_username = "${drawuser}"`);
            interaction.member.removeRole(role);
            return res.changes > 0;
        }
    }
    if (maxbottradesbet.toString() > "0") {
        if (homestatus === "✅" && homeuser) {
            interaction.createMessage({
                embeds: [
                    {
                        description: `You voted right so you will get **${homeuserbet} * ${multiplier}** bot trades`,
                        color: 3319890
                    }
                ]
            });
            const res = await db.runPromise(`UPDATE users SET bottrades = bottrades + ${homeuserbet} * ${multiplier} WHERE madfut_username = "${homeuser}"`);
            const res2 = await db.runPromise(`DELETE FROM home WHERE madfut_username = "${homeuser}"`);
            interaction.member.removeRole(role);
            return res.changes > 0;
        }
        if (awaystatus === "✅" && awayuser) {
            interaction.createMessage({
                embeds: [
                    {
                        description: `You voted right so you will get **${awayuserbet} * ${multiplier}** bot trades`,
                        color: 3319890
                    }
                ]
            });
            const res = await db.runPromise(`UPDATE users SET bottrades = bottrades + ${awayuserbet} * ${multiplier} WHERE madfut_username = "${awayuser}"`);
            const res2 = await db.runPromise(`DELETE FROM away WHERE madfut_username = "${awayuser}"`);
            interaction.member.removeRole(role);
            return res.changes > 0;
        }
        if (drawstatus === "✅" && drawuser) {
            interaction.createMessage({
                embeds: [
                    {
                        description: `You voted right so you will get **${drawuserbet} * ${multiplier}** bot trades`,
                        color: 3319890
                    }
                ]
            });
            const res = await db.runPromise(`UPDATE users SET bottrades = bottrades + ${drawuserbet} * ${multiplier} WHERE madfut_username = "${drawuser}"`);
            const res2 = await db.runPromise(`DELETE FROM draw WHERE madfut_username = "${drawuser}"`);
            interaction.member.removeRole(role);
            return res.changes > 0;
        }
    }
});
bot.on("dailyspin", async (interaction)=>{
    const getTime = await db.getDailySpinTime(interaction.member.id);
    if (getTime.toString() < Date.now().toString()) {
        return interaction.createMessage({
            embeds: [
                {
                    description: `🚫 You have already spinned in the past 24 hours. Try it again <t:${getTime}:R>`,
                    color: 15158332
                }
            ],
            flags: Constants.MessageFlags.EPHEMERAL
        });
    }
});
let invitemessage;
bot.on("invite", async (interaction, amount, packs, username, coins)=>{
    if (packs.length > 3) {
        interaction.createMessage({
            embeds: [
                {
                    color: 15417396,
                    description: `❌ You can't pick more than 3 packs.`
                }
            ],
            flags: Constants.MessageFlags.EPHEMERAL
        });
        return;
    }
    const usernameMe = await db.getMadfutUserByDiscordUser(interaction.member.id);
    if (!usernameMe) {
        interaction.createMessage({
            embeds: [
                {
                    color: 15417396,
                    description: "❌ You have not linked your Madfut account."
                }
            ],
            flags: Constants.MessageFlags.EPHEMERAL
        });
        return;
    }
    // const stResult = db.startTransaction(interaction.member!.id);
    //     if (!stResult.success) {
    //     interaction.createMessage({embeds: [
    //         {
    //             color: 15158332,
    //             description: "❌ You have a ongoing transaction."
    //         }
    //     ],
    //     flags: Constants.MessageFlags.EPHEMERAL
    // });
    //     return;
    // }
    const invatation = await interaction.createMessage({
        embeds: [
            {
                color: 3319890,
                description: `You have been invited on madfut. Accept the invite and do the trade. After the acception you have to click on the button if the pack was correct or wrong.\nYou have 1 minute to accept the trade, otherwise you have to do the command again.`
            }
        ]
    });
    // for (let i = 0; i < 1;) {
    //     let tradeRef;
    //     try {
    //         tradeRef = await madfutClient.inviteWithTimeout(usernameMe, 60000, `${generateString(10)}`);
    //         console.log(`${usernameMe} accepted invite.`);
    //     } catch {
    //         console.log(`${usernameMe} rejected invite.`);
    //         continue;
    //     }
    //     try {
    //         await madfutClient.doTrade(tradeRef, async (profile) => ({
    //             receiveCoins: false,
    //             receiveCards: false,
    //             receivePacks: false,
    //             giveCards: profile[ProfileProperty.wishList]?.slice(0, 0) as Max3Array<string> ?? [],
    //             giveCoins: coins,
    //             givePacks: packs ? packs.map(pack => ({pack, amount: 1})) as Max3Array<{pack: string, amount:number}> : packs
    //         }));
    //         invitemessage = await interaction.editOriginalMessage({
    //             embeds: [
    //                 {
    //                     color: 0x32A852,
    //                     description: `Click on the button below if the packs where correct or wrong`
    //                 }
    //             ],
    //             components: [
    //                 {
    //                     type: Constants.ComponentTypes.ACTION_ROW,
    //                     components: [
    //                         {
    //                             custom_id: "correct-packs",
    //                             type: Constants.ComponentTypes.BUTTON,
    //                             style: Constants.ButtonStyles.SUCCESS,
    //                             label: "👍"
    //                         },
    //                         {
    //                             custom_id: "wrong-packs",
    //                             type: Constants.ComponentTypes.BUTTON,
    //                             style: Constants.ButtonStyles.DANGER,
    //                             label: "👎"
    //                         }
    //                     ]
    //                 }
    //             ],
    //         });
    //         console.log(`Completed trade with ${usernameMe}`);
    //         i++;
    //     } catch (err) {
    //         console.log(`Trade with ${usernameMe} failed: Player left`);
    //         i++;
    //         invitemessage = await interaction.editOriginalMessage({
    //             embeds: [
    //                 {
    //                     color: 15158332,
    //                     description: `You left the trade. This can mean that the packs where wrong. Use the command again and change the packs`
    //                 }
    //             ]
    //         });
    //     }
    // }
    // const messageId = (await interaction.getOriginalMessage()).id;
    // bot.setPermittedReact(messageId, interaction.member!.id);
    // const result = await Promise.race([once(bot, "invitepacks" + messageId), sleep(30000)]);
    // bot.removeAllListeners("invitepacks" + messageId);
    // await bot.editMessage(invitemessage.channel.id, invitemessage.id, {
    //     components: []
    // });
    // if (!result) {
    //     await interaction.editMessage(invitemessage.id, {
    //         embeds: [
    //             {
    //                 color: 15158332, 
    //                 description: "You didn't answer the buttons in time so the trades will be canceld"
    //             }
    //         ],
    //     });
    //     return;
    // }
    // const [reactInteraction, reaction] = result as [ComponentInteraction, boolean];
    // reactInteraction.acknowledge();
    // if (!reaction) { // declined
    //     await interaction.editMessage(invitemessage.id, {
    //         embeds: [
    //             {
    //                 color: 15158332, 
    //                 description: "The packs where wrong. The user you want to sent the trades to, doesn't get the invites now. Use the command again and change the packs"
    //             }
    //         ],
    //     });
    //     return;
    // }
    // if (reaction) {
    //     await interaction.editMessage(invitemessage.id, {
    //         embeds: [
    //             {
    //                 color: 0x32A852, 
    //                 description: `The Madfut user \`${username}\` have successfully received \`${amount}\` trades with \`${coins}\` coins and the packs you've chosen.`
    //             }
    //         ]
    //     });
    freetradepacks(interaction, username, amount, coins, packs ? packs.map((pack)=>({
            pack,
            amount: 1
        })
    ) : packs);
//}
});
bot.on("end-transaction", (interaction, userId)=>{
    db.endTransaction(userId);
    interaction.createMessage({
        embeds: [
            {
                color: 3319890,
                description: `✅ Successfully force-ended all transactions for <@${userId}>`
            }
        ],
        flags: Constants.MessageFlags.EPHEMERAL
    });
    console.log(`${interaction.member?.username} force-ended the transactions from ${userId}`);
});
bot.on("pay", async (interaction, otherUserId, coins, cards, packs, bottrades)=>{
    const coinsError = verifyCoins(coins, 0, Number.MAX_SAFE_INTEGER, "pay");
    if (coinsError) {
        interaction.createMessage(coinsError);
        return;
    }
    const botTradesError = verifyBotTrades(bottrades, 0, Number.MAX_SAFE_INTEGER, "pay");
    if (botTradesError) {
        interaction.createMessage(botTradesError);
        return;
    }
    const userId = interaction.member.id;
    const stResult = db.startTransaction(userId);
    if (!stResult.success) {
        interaction.createMessage({
            embeds: [
                {
                    color: 15158332,
                    description: `You cannot pay because ${stResult.error}.`
                }
            ]
        });
        return;
    }
    const stResult2 = db.startTransaction(otherUserId);
    if (!stResult2.success) {
        interaction.createMessage({
            embeds: [
                {
                    color: 15158332,
                    description: "The user you want to pay have a ongoing transaction, so you can't pay him right now."
                }
            ]
        });
        db.endTransaction(userId);
        return;
    }
    try {
        await interaction.acknowledge();
        const wallet = await db.getWallet(userId);
        const walletVerification = verifyWallet(wallet, coins, cards, packs, "pay", "your");
        const botWalletVerification = verifyBotWallet(wallet, bottrades, "pay", "your");
        if (!walletVerification.success) {
            interaction.editOriginalMessage(walletVerification.failureMessage);
            return;
        }
        if (!botWalletVerification.success) {
            interaction.editOriginalMessage(botWalletVerification.failureMessage);
            return;
        }
        const { finalCards , finalPacks  } = walletVerification;
        const username = await db.getMadfutUserByDiscordUser(userId);
        if (!username) {
            interaction.createFollowup({
                embeds: [
                    {
                        color: 15158332,
                        description: "There is no MADFUT account linked to your Discord account so you cannot pay. To link one, use `/madfut link <username>`."
                    }
                ]
            });
            return;
        }
        const otherUsername = await db.getMadfutUserByDiscordUser(otherUserId);
        if (!otherUsername) {
            interaction.createFollowup({
                embeds: [
                    {
                        color: 15158332,
                        description: "The user you want to pay have not linked their MADFUT account to his Discord account so you can't pay him. To link one, use `/madfut link <username>`."
                    }
                ]
            });
            return;
        }
        const transactions = [];
        transactions.push(db.removeBotTrades(userId, bottrades));
        transactions.push(db.addBotTrades(otherUserId, bottrades));
        transactions.push(db.addCoins(userId, -coins));
        transactions.push(db.addCoins(otherUserId, coins));
        for (const card of finalCards){
            transactions.push(db.addCards(otherUserId, card.id, card.amount));
            transactions.push(db.addCards(userId, card.id, -card.amount));
        }
        for (const pack of finalPacks){
            transactions.push(db.addPacks(otherUserId, pack.id, pack.amount));
            transactions.push(db.addPacks(userId, pack.id, -pack.amount));
        }
        await Promise.all(transactions);
    } finally{
        db.endTransaction(userId);
        db.endTransaction(otherUserId);
    }
    interaction.createFollowup({
        embeds: [
            {
                color: 3319890,
                description: `✅ Your payment to <@${otherUserId}> was successful.`
            }
        ]
    });
});
bot.on("admin-pay", async (interaction, otherUserId, coins, cards, packs, bottrades)=>{
    const coinsError = verifyCoins(coins, 0, Number.MAX_SAFE_INTEGER, "pay");
    if (coinsError) {
        interaction.createMessage(coinsError);
        return;
    }
    const botTradesError = verifyBotTrades(bottrades, 0, Number.MAX_SAFE_INTEGER, "pay");
    if (botTradesError) {
        interaction.createMessage(botTradesError);
        return;
    }
    const stResult2 = db.startTransaction(otherUserId);
    if (!stResult2.success) {
        interaction.createMessage({
            embeds: [
                {
                    color: 15158332,
                    description: "The user you want to pay have a ongoing transaction, so you can't pay him right now."
                }
            ]
        });
        return;
    }
    try {
        await interaction.acknowledge();
        const otherUsername = await db.getMadfutUserByDiscordUser(otherUserId);
        if (!otherUsername) {
            interaction.createFollowup({
                embeds: [
                    {
                        color: 15158332,
                        description: "The user you want to pay have not linked their MADFUT account to his Discord account so you can't pay him. To link one, use `/madfut link <username>`."
                    }
                ]
            });
            return;
        }
        const transactions = [];
        transactions.push(db.addCoins(otherUserId, coins));
        transactions.push(db.addBotTrades(otherUserId, bottrades));
        for (const card of cards){
            const [cardId, cardAmount] = extractAmount(card);
            transactions.push(db.addCards(otherUserId, cardId, cardAmount));
        }
        for (const pack of packs){
            const [packId, packAmount] = extractAmount(pack);
            transactions.push(db.addPacks(otherUserId, packId, packAmount));
        }
        await Promise.all(transactions);
    } finally{
        db.endTransaction(otherUserId);
    }
    interaction.createFollowup({
        embeds: [
            {
                color: 3319890,
                description: `✅ Your admin payment to <@${otherUserId}> was successful!`
            }
        ]
    });
});
bot.on("remove", async (interaction, otherUserId, coins, cards, packs, bottrades)=>{
    const stResult2 = db.startTransaction(otherUserId);
    if (!stResult2.success) {
        interaction.createMessage({
            embeds: [
                {
                    color: 15158332,
                    description: "The user you want to remove items from have a ongoing transaction, so you can't remove items from him right now."
                }
            ]
        });
        return;
    }
    try {
        await interaction.acknowledge();
        const otherUsername = await db.getMadfutUserByDiscordUser(otherUserId);
        if (!otherUsername) {
            interaction.createFollowup({
                embeds: [
                    {
                        color: 15158332,
                        description: "The user you want to remove items from have not linked their MADFUT account to his Discord account so you can't remove items from him. To link one, use `/madfut link <username>`."
                    }
                ]
            });
            return;
        }
        const wallet = await db.getWallet(otherUserId);
        const walletVerification = verifyWallet(wallet, coins, cards, packs, "remove", "the other user's");
        const botWalletVerification = verifyBotWallet(wallet, bottrades, "remove", "the other user's");
        if (!walletVerification.success) {
            interaction.editOriginalMessage(walletVerification.failureMessage);
            return;
        }
        if (!botWalletVerification.success) {
            interaction.editOriginalMessage(botWalletVerification.failureMessage);
            return;
        }
        const { finalCards , finalPacks  } = walletVerification;
        const transactions = [];
        transactions.push(db.addCoins(otherUserId, -coins));
        transactions.push(db.addBotTrades(otherUserId, -bottrades));
        for (const card of finalCards){
            transactions.push(db.addCards(otherUserId, card.id, -card.amount));
        }
        for (const pack of finalPacks){
            transactions.push(db.addPacks(otherUserId, pack.id, -pack.amount));
        }
        await Promise.all(transactions);
    } finally{
        db.endTransaction(otherUserId);
    }
    interaction.createFollowup({
        embeds: [
            {
                color: 3319890,
                description: `✅ Your admin removement from <@${otherUserId}> was successful!`
            }
        ]
    });
});
bot.on("trade", async (interaction, otherUserId, givingCoins, givingCards, givingPacks, givingBotTrades, receivingCoins, receivingCards, receivingPacks, receivingBotTrades)=>{
    let coinsError = verifyCoins(givingCoins, 0, Number.MAX_SAFE_INTEGER, "give");
    if (coinsError) {
        interaction.createMessage(coinsError);
        return;
    }
    coinsError = verifyCoins(receivingCoins, 0, Number.MAX_SAFE_INTEGER, "receive");
    if (coinsError) {
        interaction.createMessage(coinsError);
        return;
    }
    let botTradesError = verifyBotTrades(givingBotTrades, 0, Number.MAX_SAFE_INTEGER, "give");
    if (botTradesError) {
        interaction.createMessage(botTradesError);
        return;
    }
    botTradesError = verifyBotTrades(receivingBotTrades, 0, Number.MAX_SAFE_INTEGER, "receive");
    if (botTradesError) {
        interaction.createMessage(botTradesError);
        return;
    }
    if (givingCoins !== 0 && receivingCoins !== 0) {
        interaction.createMessage({
            embeds: [
                {
                    color: 15158332,
                    description: "You cannot both give and receive coins at the same time."
                }
            ]
        });
        return;
    }
    if (givingBotTrades !== 0 && receivingBotTrades !== 0) {
        interaction.createMessage({
            embeds: [
                {
                    color: 15158332,
                    description: "You cannot both give and receive bot trades at the same time."
                }
            ]
        });
        return;
    }
    await interaction.acknowledge();
    const userId = interaction.member.id;
    const myWallet = await db.getWallet(userId);
    const myWalletVerification = verifyWallet(myWallet, givingCoins, givingCards, givingPacks, "give", "your");
    const myBotWalletVerification = verifyBotWallet(myWallet, givingBotTrades, "give", "your");
    if (!myWalletVerification.success) {
        interaction.editOriginalMessage(myWalletVerification.failureMessage);
        return;
    }
    if (!myBotWalletVerification.success) {
        interaction.editOriginalMessage(myBotWalletVerification.failureMessage);
        return;
    }
    const { finalCards: myFinalCards , finalPacks: myFinalPacks  } = myWalletVerification;
    const otherWallet = await db.getWallet(otherUserId);
    const otherWalletVerification = verifyWallet(otherWallet, receivingCoins, receivingCards, receivingPacks, "receive", "the other user's");
    const otherBotWalletVerification = verifyBotWallet(otherWallet, receivingBotTrades, "receive", "the other user's");
    if (!otherWalletVerification.success) {
        interaction.editOriginalMessage(otherWalletVerification.failureMessage);
        return;
    }
    if (!otherBotWalletVerification.success) {
        interaction.editOriginalMessage(otherBotWalletVerification.failureMessage);
        return;
    }
    const { finalCards: otherFinalCards , finalPacks: otherFinalPacks  } = otherWalletVerification;
    const msg = {
        embeds: [
            {
                color: 3319890,
                author: {
                    name: `Trade Request`,
                    icon_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Human-emblem-handshake.svg/240px-Human-emblem-handshake.svg.png"
                },
                description: `<@${otherUserId}>, <@${userId}> wants to trade with you. You have 1 minute to decide.`,
                fields: [
                    {
                        name: "<:madfutters_coins:960473296942538762> Coins",
                        value: `You will *${givingCoins === 0 ? "give* **" + formatNum(receivingCoins) : "receive* **" + formatNum(givingCoins)} coins**.`
                    },
                    {
                        name: "Bot Trades",
                        value: `You will *${givingBotTrades === 0 ? "give* **" + formatNum(receivingBotTrades) : "receive* **" + formatNum(givingBotTrades)} coins**.`
                    },
                    {
                        name: "<:tots:897124228539756634> Cards you will receive",
                        value: myFinalCards.size === 0 ? "No cards." : myFinalCards.map((card)=>`${card.amount}x **${card.displayName}**`
                        ).join("\n")
                    },
                    {
                        name: "<:madfutters_packs:960473297018040410>Packs you will receive",
                        value: myFinalPacks.size === 0 ? "No packs." : myFinalPacks.map((pack)=>`${pack.amount}x **${pack.displayName}**`
                        ).join("\n")
                    },
                    {
                        name: "<:tots:897124228539756634> Cards you will give",
                        value: otherFinalCards.size === 0 ? "No cards." : otherFinalCards.map((card)=>`${card.amount}x **${card.displayName}**`
                        ).join("\n")
                    },
                    {
                        name: "<:madfutters_packs:960473297018040410>Packs you will give",
                        value: otherFinalPacks.size === 0 ? "No packs." : otherFinalPacks.map((pack)=>`${pack.amount}x **${pack.displayName}**`
                        ).join("\n")
                    }
                ]
            }
        ],
        components: [
            {
                type: Constants.ComponentTypes.ACTION_ROW,
                components: [
                    {
                        custom_id: "trade-confirm",
                        type: Constants.ComponentTypes.BUTTON,
                        style: Constants.ButtonStyles.SUCCESS,
                        label: "Confirm"
                    },
                    {
                        custom_id: "trade-decline",
                        type: Constants.ComponentTypes.BUTTON,
                        style: Constants.ButtonStyles.DANGER,
                        label: "Decline"
                    }
                ]
            }
        ]
    };
    interaction.createMessage(msg);
    const messageId = (await interaction.getOriginalMessage()).id;
    bot.setPermittedReact(messageId, otherUserId);
    const result = await Promise.race([
        once(bot, "tradereact" + messageId),
        sleep(60000)
    ]);
    bot.removeAllListeners("tradereact" + messageId);
    msg.components = [];
    if (!result) {
        msg.embeds[0].footer = {
            text: "This trade request has expired."
        };
        interaction.editOriginalMessage(msg);
        return;
    }
    const [reactInteraction, reaction] = result;
    reactInteraction.acknowledge();
    if (!reaction) {
        msg.embeds[0].footer = {
            text: "This trade request has been declined."
        };
        interaction.editOriginalMessage(msg);
        return;
    }
    interaction.editOriginalMessage(msg);
    // trade request accepted
    const stResult = db.startTransaction(userId);
    if (!stResult.success) {
        interaction.createFollowup(stResult.globalError ? `You cannot trade because ${stResult.error}.` : `You cannot trade because <@${userId}> has an ongoing transaction.`);
        return;
    }
    const stResult2 = db.startTransaction(otherUserId);
    if (!stResult2.success) {
        interaction.createFollowup(stResult2.globalError ? `You cannot trade because ${stResult2.error}.` : `You cannot trade because <@${otherUserId}> has an ongoing transaction.`);
        db.endTransaction(userId);
        return;
    }
    try {
        const myWalletVerification2 = verifyWallet(await db.getWallet(userId), givingCoins, givingCards, givingPacks, "receive", `<@${userId}>'s`);
        const myBotWalletVerification2 = verifyBotWallet(await db.getWallet(userId), givingBotTrades, "receive", `<@${userId}>'s`); // TODO: name collisions could cause success even if the user doesn't have the original packs
        if (!myWalletVerification2.success) {
            interaction.createFollowup(myWalletVerification2.failureMessage);
            return;
        }
        if (!myBotWalletVerification2.success) {
            interaction.createFollowup(myBotWalletVerification2.failureMessage);
            return;
        }
        const otherWalletVerification2 = verifyWallet(await db.getWallet(otherUserId), receivingCoins, receivingCards, receivingPacks, "give", `<@${otherUserId}>'s`);
        const otherBotWalletVerification2 = verifyBotWallet(await db.getWallet(otherUserId), receivingBotTrades, "give", `<@${otherUserId}>'s`);
        if (!otherWalletVerification2.success) {
            interaction.createFollowup(otherWalletVerification2.failureMessage);
            return;
        }
        if (!otherBotWalletVerification2.success) {
            interaction.createFollowup(otherBotWalletVerification2.failureMessage);
            return;
        }
        const username = await db.getMadfutUserByDiscordUser(userId);
        if (!username) {
            interaction.createFollowup({
                embeds: [
                    {
                        color: 15158332,
                        description: `Trade failed as there is no MADFUT username linked to <@${userId}>'s Discord account. To link one, use \`/madfut link <username>\`.`
                    }
                ]
            });
            return;
        }
        const otherUsername = await db.getMadfutUserByDiscordUser(otherUserId);
        if (!otherUsername) {
            interaction.createFollowup({
                embeds: [
                    {
                        color: 15158332,
                        description: `Trade failed as there is no MADFUT username linked to <@${otherUserId}>'s Discord account. To link one, use \`/madfut link <username>\`.`
                    }
                ]
            });
            return;
        }
        const transactions = [];
        transactions.push(db.addBotTrades(userId, receivingBotTrades - givingBotTrades));
        transactions.push(db.addBotTrades(otherUserId, givingBotTrades - receivingBotTrades));
        transactions.push(db.addCoins(userId, receivingCoins - givingCoins));
        transactions.push(db.addCoins(otherUserId, givingCoins - receivingCoins));
        for (const card of myFinalCards){
            transactions.push(db.addCards(otherUserId, card.id, card.amount));
            transactions.push(db.addCards(userId, card.id, -card.amount));
        }
        for (const card2 of otherFinalCards){
            transactions.push(db.addCards(userId, card2.id, card2.amount));
            transactions.push(db.addCards(otherUserId, card2.id, -card2.amount));
        }
        for (const pack of myFinalPacks){
            transactions.push(db.addPacks(otherUserId, pack.id, pack.amount));
            transactions.push(db.addPacks(userId, pack.id, -pack.amount));
        }
        for (const pack2 of otherFinalPacks){
            transactions.push(db.addPacks(userId, pack2.id, pack2.amount));
            transactions.push(db.addPacks(otherUserId, pack2.id, -pack2.amount));
        }
        await Promise.all(transactions);
    } finally{
        db.endTransaction(userId);
        db.endTransaction(otherUserId);
    }
    interaction.createFollowup({
        embeds: [
            {
                color: 3319890,
                description: `✅ Trade between <@${userId}> and <@${otherUserId}> was successful.`
            }
        ]
    });
});
bot.on("flip", async (interaction, coins, heads, otherUserId)=>{
    const flipResult = getRandomInt(2) === 0;
    const iWin = flipResult === heads;
    const coinsError = verifyCoins(coins, 0, Number.MAX_SAFE_INTEGER, "flip for");
    if (coinsError) {
        interaction.createMessage(coinsError);
        return;
    }
    await interaction.acknowledge();
    const userId = interaction.member.id;
    const myWalletVerification = verifyWallet(await db.getWallet(userId), coins, [], [], "flip for", "your");
    if (!myWalletVerification.success) {
        interaction.editOriginalMessage(myWalletVerification.failureMessage);
        return;
    }
    const openFlip = !otherUserId;
    if (!openFlip) {
        const otherWalletVerification = verifyWallet(await db.getWallet(otherUserId), coins, [], [], "flip for", "the other user's");
        if (!otherWalletVerification.success) {
            interaction.editOriginalMessage(otherWalletVerification.failureMessage);
            return;
        }
    }
    const msg = {
        embeds: [
            {
                description: `${openFlip ? "Does anyone" : `<@${otherUserId}>, do you`} want to coin flip with <@${userId}> for **${formatNum(coins)} coins**? They chose **${heads ? "heads" : "tails"}**.`,
                color: 16114498,
                author: {
                    name: "Coin flip",
                    icon_url: "https://i.imgur.com/7W4WJI6.png"
                },
                footer: {
                    text: "You have 30 seconds to respond."
                }
            }
        ],
        components: [
            {
                type: Constants.ComponentTypes.ACTION_ROW,
                components: openFlip ? [
                    {
                        custom_id: "flip-confirm",
                        type: Constants.ComponentTypes.BUTTON,
                        style: Constants.ButtonStyles.SUCCESS,
                        label: "Confirm"
                    }
                ] : [
                    {
                        custom_id: "flip-confirm",
                        type: Constants.ComponentTypes.BUTTON,
                        style: Constants.ButtonStyles.SUCCESS,
                        label: "Confirm"
                    },
                    {
                        custom_id: "flip-decline",
                        type: Constants.ComponentTypes.BUTTON,
                        style: Constants.ButtonStyles.DANGER,
                        label: "Decline"
                    }
                ]
            }
        ]
    };
    interaction.createMessage(msg);
    const messageId = (await interaction.getOriginalMessage()).id;
    bot.setPermittedReact(messageId, otherUserId ?? true);
    const result = await Promise.race([
        once(bot, "flipreact" + messageId),
        sleep(30000)
    ]);
    bot.removeAllListeners("flipreact" + messageId);
    msg.components = [];
    if (!result) {
        msg.embeds[0].footer = {
            text: "This coin flip request has expired."
        };
        interaction.editOriginalMessage(msg);
        return;
    }
    const [reactInteraction, reaction] = result;
    reactInteraction.acknowledge();
    otherUserId = reactInteraction.member.id;
    if (!reaction) {
        msg.embeds[0].footer = {
            text: "This coin flip request has been declined."
        };
        interaction.editOriginalMessage(msg);
        return;
    }
    interaction.editOriginalMessage(msg);
    // flip request accepted
    const stResult = db.startTransaction(userId);
    if (!stResult.success) {
        interaction.createFollowup({
            embeds: [
                {
                    color: 15158332,
                    description: stResult.globalError ? `You cannot flip because ${stResult.error}.` : `You cannot flip because <@${userId}> has an ongoing transaction.`
                }
            ]
        });
        return;
    }
    const stResult2 = db.startTransaction(otherUserId);
    if (!stResult2.success) {
        interaction.createFollowup({
            embeds: [
                {
                    color: 15158332,
                    description: stResult2.globalError ? `You cannot flip because ${stResult2.error}.` : `You cannot flip because <@${otherUserId}> has an ongoing transaction.`
                }
            ]
        });
        db.endTransaction(userId);
        return;
    }
    try {
        const myWalletVerification2 = verifyWallet(await db.getWallet(userId), coins, [], [], "flip for", `<@${userId}>'s`);
        if (!myWalletVerification2.success) {
            interaction.createFollowup(myWalletVerification2.failureMessage);
            return;
        }
        const otherWalletVerification2 = verifyWallet(await db.getWallet(otherUserId), coins, [], [], "flip for", `<@${otherUserId}>'s`);
        if (!otherWalletVerification2.success) {
            interaction.createFollowup(otherWalletVerification2.failureMessage);
            return;
        }
        const username = await db.getMadfutUserByDiscordUser(userId);
        if (!username) {
            interaction.createFollowup({
                embeds: [
                    {
                        color: 15158332,
                        description: `Coin flip failed as there is no MADFUT username linked to <@${userId}>'s Discord account. To link one, use \`/madfut link <username>\`.`
                    }
                ]
            });
            return;
        }
        const otherUsername = await db.getMadfutUserByDiscordUser(otherUserId);
        if (!otherUsername) {
            interaction.createFollowup({
                embeds: [
                    {
                        color: 15158332,
                        description: `Coin flip failed as there is no MADFUT username linked to <@${otherUserId}>'s Discord account. To link one, use \`/madfut link <username>\`.`
                    }
                ]
            });
            return;
        }
        const transactions = [];
        transactions.push(db.addCoins(userId, iWin ? coins : -coins));
        transactions.push(db.addCoins(otherUserId, iWin ? -coins : coins));
        await Promise.all(transactions);
    } finally{
        db.endTransaction(userId);
        db.endTransaction(otherUserId);
    }
    interaction.createFollowup({
        embeds: [
            {
                color: 16114498,
                author: {
                    name: "Coin flip",
                    icon_url: "https://i.imgur.com/7W4WJI6.png"
                },
                description: `**${flipResult ? "Heads" : "Tails"}**! <@${iWin ? userId : otherUserId}> won the coin flip against <@${iWin ? otherUserId : userId}> for **${formatNum(coins)} coins**.`
            }
        ]
    });
});
const allowedPacks = [
    "silver_special",
    "bf_nine_special",
    "bf_five_special",
    "totw",
    "fatal_rare",
    "bf_93_special",
    "bf_95_special",
    "fatal_special",
    "double_special",
    "triple_special",
    "gold",
    "random",
    "gold_super",
    "rare",
    "bf_94_special",
    "bf_eight_special",
    "free",
    "silver_plus",
    "no_totw_special",
    "fatal_silver",
    "85_special",
    "bf_89_special",
    "bf_88_special",
    "bf_four_special",
    "bf_seven_special",
    "gold_mega",
    "special",
    "rainbow",
    "bf_six_special",
    "bf_92_special",
    "80+",
    "bf_86_special",
    "fatal_nonrare",
    "bf_91_special",
    "bf_87_special",
    "silver",
    "op_special",
    "bf_90_special",
    "fatal_bronze",
    "pp_sbc_real_madrid_icons",
    "pp_new_87_91",
    "pp_fut_champs",
    "pp_new_81_84",
    "pp_special",
    "pp_special_88_92",
    "pp_best_1",
    "pp_new_83_86",
    "pp_new_77_82",
    "pp_new_85_88",
    "pp_bad_1",
    "pp_totw",
    "pp_new_special",
    "pp_icons_86_92",
    "pp_mega",
    "pp_good_1",
    "pp_icon",
    "pp_special_83_86",
    "pp_special_81_84",
    "pp_special_85_88",
    "pp_special_86_89"
];
bot.on("invme", async (interaction, coins, myPacks)=>{
    const userId = interaction.member.id;
    if (myPacks) {
        if (myPacks.length > 3) {
            interaction.createMessage({
                embeds: [
                    {
                        color: 15417396,
                        description: `❌ You can't pick more than 3 packs.`
                    }
                ],
                flags: Constants.MessageFlags.EPHEMERAL
            });
            return;
        }
        for (const pack of myPacks){
            if (!allowedPacks.includes(pack)) {
                interaction.createMessage({
                    embeds: [
                        {
                            color: 15417396,
                            description: `❌ Invalid pack \`${pack}\`.`
                        }
                    ],
                    flags: Constants.MessageFlags.EPHEMERAL
                });
                return;
            }
        }
    }
    coins = Math.max(Math.min(coins, 10000000), 0);
    const username = await db.getMadfutUserByDiscordUser(userId);
    if (!username) {
        interaction.createMessage({
            embeds: [
                {
                    color: 15417396,
                    description: "❌ You have no MADFUT account linked."
                }
            ],
            flags: Constants.MessageFlags.EPHEMERAL
        });
        return;
    }
    interaction.createMessage({
        embeds: [
            {
                color: 3319890,
                description: "✅ Command successful."
            }
        ],
        flags: Constants.MessageFlags.EPHEMERAL
    });
    freeTradeUnlimited(username, coins, myPacks ? myPacks.map((pack)=>({
            pack,
            amount: 1
        })
    ) : packs1);
});
bot.on("setpacks", async (interaction, thepacks)=>{
    packs1 = thepacks.map((packname)=>({
            pack: packname,
            amount: 1
        })
    );
    interaction.createMessage({
        embeds: [
            {
                color: 3319890,
                description: "✅ Command successful."
            }
        ],
        flags: Constants.MessageFlags.EPHEMERAL
    });
    console.log(`${interaction.member?.username} set the following packs to giveaways: ${thepacks}`);
});
bot.on("freetrade", async (interaction, amount, username, userId)=>{
    if (!username && !userId) {
        interaction.createMessage({
            embeds: [
                {
                    color: 15417396,
                    description: "❌ Enter either a username or a discord user."
                }
            ],
            flags: Constants.MessageFlags.EPHEMERAL
        });
        return;
    } else if (userId) {
        username = await db.getMadfutUserByDiscordUser(userId);
        if (!username) {
            interaction.createMessage({
                embeds: [
                    {
                        color: 15417396,
                        description: "❌ User does not have their MADFUT account linked."
                    }
                ],
                flags: Constants.MessageFlags.EPHEMERAL
            });
            return;
        }
    }
    username = username;
    freeTrade(username, amount);
    const message = await bot.sendMessage(interaction.channel.id, {
        embeds: [
            {
                color: 3066993,
                description: `${userId} has ${amount} trade(s)`,
                footer: {
                    text: "Don't delete this message until the counter is at zero!"
                }
            }
        ]
    });
});
let giveawayRunning = false;
let giveawayStartTimeout;
let giveawayEndTimeout;
let giveawayDuration;
let rawGiveawayDuration;
let giveawayMessage;
bot.on("ga-forcestop", async (interaction)=>{
    giveawayEnd(interaction.channel.id);
    interaction.createMessage({
        content: "Force stop successful",
        flags: Constants.MessageFlags.EPHEMERAL
    });
    console.log(`${interaction.member?.username} forcestoped the giveaway.`);
    return;
});
bot.on("ga-announce", async (interaction, start, duration)=>{
    if (isNaN(parseFloat(start))) {
        interaction.createMessage({
            content: "Enter a valid number of minutes for the start",
            flags: Constants.MessageFlags.EPHEMERAL
        });
        return;
    }
    if (duration && isNaN(parseFloat(start))) {
        interaction.createMessage({
            content: "Enter a valid number of minutes for the duration",
            flags: Constants.MessageFlags.EPHEMERAL
        });
        return;
    }
    const durationMinutes = duration ? parseFloat(duration) : undefined;
    rawGiveawayDuration = duration;
    giveawayDuration = durationMinutes ? durationMinutes * 60000 : undefined;
    const minutes = parseFloat(start);
    const startTime = Math.round(Date.now() / 1000 + minutes * 60);
    await interaction.createMessage({
        content: "Command successful",
        flags: Constants.MessageFlags.EPHEMERAL
    });
    console.log(`${interaction.member?.username} has started a giveaway which will start in ${start} minute(s) and have a duration from ${duration} minute(s)`);
    const channelId = interaction.channel.id;
    giveawayMessage = await bot.sendMessage(channelId, {
        allowedMentions: {
            roles: [
                bot.config.giveawayPingRoleId
            ]
        },
        content: `<@&${bot.config.giveawayPingRoleId}>`,
        embeds: [
            {
                color: 3319890,
                author: {
                    name: "🎉 Bot Giveaway 🎉",
                    icon_url: "https://i.imgur.com/n0PM6LB.png"
                },
                description: `A giveaway for ${duration ? duration + " minutes long " : ""}will start in <t:${startTime}:R>!\n\n⚠️**Make sure to link your madfut account in <#${bot.config.commandsChannelId}>, otherwise you will not get invited!**⚠️\n\nClick on 🎉 to enter the giveaway!`
            }
        ]
    });
    //`<@&${bot.config.giveawayPingRoleId}>, a ${duration ? duration + " minute long " : ""}giveaway is starting <t:${startTime}:R>!\n\n⚠️**Make sure to link your madfut account in <channel>, otherwise you will not get invited!**⚠️\nClick on the 🎉 to enter the giveaway!`
    await bot.react(giveawayMessage, "🎉");
    giveawayStartTimeout = setTimeout(()=>{
        giveawayStart();
    }, minutes * 60000);
    return;
});
bot.on("ga-forcestart", async (interaction)=>{
    giveawayStart();
    interaction.createMessage({
        content: "Force start successful",
        flags: Constants.MessageFlags.EPHEMERAL
    });
    console.log(`${interaction.member?.username} forcestart a giveaway.`);
    return;
});
async function giveawayTrade(username) {
    while(giveawayRunning){
        let tradeRef;
        try {
            tradeRef = await madfutClient.inviteWithTimeout(username, 60000, `${generateString(10)}`);
        } catch  {
            console.log(`${username} rejected invite or timed out.`);
            break;
        }
        try {
            await madfutClient.doTrade(tradeRef, async (profile)=>({
                    receiveCoins: false,
                    receiveCards: false,
                    receivePacks: false,
                    giveCards: profile[ProfileProperty.wishList]?.slice(0, 3) ?? [],
                    giveCoins: 10000000,
                    givePacks: packs1
                })
            );
            console.log(`Completed giveaway trade with ${username}`);
        } catch (_err) {
            console.log(`Giveaway trade with ${username} failed: Player left`);
        }
    }
}
async function giveawayStart() {
    if (giveawayStartTimeout) clearTimeout(giveawayStartTimeout);
    if (giveawayMessage) {
        await bot.editMessage(giveawayMessage.channel.id, giveawayMessage.id, {
            //content: `Signups for this giveaway are now closed. The giveaway will be starting shortly.`,
            embeds: [
                {
                    color: 15158332,
                    author: {
                        name: "Giveaway closed",
                        icon_url: "https://i.imgur.com/n0PM6LB.png"
                    },
                    description: "The giveaway is closed, which means you can no longer participate in this giveaway. The giveaway will start soon."
                }
            ],
            components: []
        });
    }
    bot.removeAllListeners("giveawayjoin");
    giveawayRunning = true;
    const giveawaySignups = await db.getMadfutUsersByDiscordUsers(await bot.getReacts(giveawayMessage, "🎉"));
    for (const username of giveawaySignups){
        console.log("signupper", username);
        giveawayTrade(username);
    }
    await bot.sendMessage(giveawayMessage.channel.id, {
        allowedMentions: {
            roles: [
                bot.config.giveawayPingRoleId
            ]
        },
        content: `<@&${bot.config.giveawayPingRoleId}>`,
        embeds: [
            {
                color: 3319890,
                author: {
                    name: "Giveaway Started!",
                    icon_url: "https://i.imgur.com/n0PM6LB.png"
                },
                description: `The ${rawGiveawayDuration ? rawGiveawayDuration + " minutes long " : ""}giveaway has started with **${giveawaySignups.length} people**! Look at your invites in madfut and trade as many times as you can!`
            }
        ]
    });
    if (giveawayDuration) {
        giveawayEndTimeout = setTimeout(()=>{
            giveawayEnd(giveawayMessage.channel.id);
        }, giveawayDuration);
    }
}
async function giveawayEnd(channelId) {
    giveawayRunning = false;
    if (giveawayEndTimeout) clearTimeout(giveawayEndTimeout);
    bot.sendMessage(channelId, {
        allowedMentions: {
            roles: [
                bot.config.giveawayPingRoleId
            ]
        },
        content: `<@&${bot.config.giveawayPingRoleId}>`,
        embeds: [
            {
                color: 22500,
                author: {
                    name: "Giveaway Ended",
                    icon_url: "https://i.imgur.com/n0PM6LB.png"
                },
                description: "**The giveaway has ended!**\n\nIf you don't want to miss next time. Then go to the <#896697780783960084> and grab your role!"
            }
        ]
    });
}
console.log("Bot event listeners registered");
console.log("Started");

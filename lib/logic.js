/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* global getAssetRegistry getFactory emit */

/**
 * Sample transaction processor function.
 * @param {org.acn.bank.AddParticipant} tx The sample transaction instance.
 * @transaction
 */
async function addParticipant(tx) {  // eslint-disable-line no-unused-vars

    var namespace = "org.acn.bank";
    const factory = getFactory();

    // Create Client
    const newClient = factory.newResource(namespace, 'Client', tx.newParticipant.participantId);
    newClient.firstName = tx.newParticipant.firstName;
    newClient.lastName = tx.newParticipant.lastName;
    newClient.walletId = tx.wallet.walletId;
  
    // Add the Client to the registry.
    const participantRegistry = await getParticipantRegistry(namespace + '.Client');
    await participantRegistry.add(newClient);
  
    // create Wallet
    const walletAsset = factory.newResource(namespace, 'Wallet', tx.wallet.walletId);
    walletAsset.money = tx.wallet.money;
    //walletAsset.owner = tx.newParticipant;

    // Add the bond asset to the registry.
    const assetRegistry = await getAssetRegistry(namespace + '.Wallet');
    await assetRegistry.add(walletAsset);
}

/**
 * Sample transaction processor function.
 * @param {org.acn.bank.DelParticipant} tx The sample transaction instance.
 * @transaction
 */
async function delParticipant(tx) {  // eslint-disable-line no-unused-vars

  	//remove Wallet
    const assestRegistry = await getAssetRegistry('org.acn.bank.Wallet');
    //var q = buildQuery('SELECT org.acn.bank.Wallet WHERE (owner == _$owner)');

  	/*const delWallets = await query(q, {owner : 'resource:' + tx.tarParticipant.getFullyQualifiedIdentifier()});
    delWallets.forEach(async trade => {
      	await assestRegistry.remove(trade);
    });*/
    assestRegistry.remove(tx.tarParticipant.walletId);
  
    //remove Participants
    const registry = await getParticipantRegistry('org.acn.bank.Client');
    await registry.remove(tx.tarParticipant);
}

/**
 * Sample transaction processor function.
 * @param {org.acn.bank.UpdParticipant} tx The sample transaction instance.
 * @transaction
 */
async function updParticipant(tx) {  // eslint-disable-line no-unused-vars

    const registry = await getParticipantRegistry('org.acn.bank.Client');
  
    tx.tarParticipant.firstName = tx.firstName;
    tx.tarParticipant.lastName = tx.lastName;
  
    await registry.update(tx.tarParticipant);
}

/**
 * Sample transaction processor function.
 * @param {org.acn.bank.TradeMoney} tx The sample transaction instance.
 * @transaction
 */
async function tradeMoney(tx) {  // eslint-disable-line no-unused-vars

    try{
      const assestRegistry = await getAssetRegistry('org.acn.bank.Wallet');

      //var enoughMoney = true;
      //var q = buildQuery('SELECT org.acn.bank.Wallet WHERE (owner == _$owner)');
      //throw new Error ('Not enough money!');
      //update account debit
      //const assestFrom = await query('selectWalletByOwner', {owner : 'resource:' + tx.ParticipantFrom.getFullyQualifiedIdentifier()});
      /*const assestFrom = await query(q, {owner : 'resource:' + tx.ParticipantFrom.getFullyQualifiedIdentifier()});
      assestFrom.forEach(async trade => {
          if (trade.money < tx.value) {
            enoughMoney = false;
            //throw new Error ('Not enough money!');
            return false;
          }
          else{
              trade.money = trade.money - tx.value;
              await assestRegistry.update(trade);
          }
      });*/
      const assestFrom = await assestRegistry.get(tx.ParticipantFrom.walletId);
      if (assestFrom.money < tx.value){
          throw new Error ('Not enough money!');
      }
      else{
          assestFrom.money = assestFrom.money - tx.value;
          await assestRegistry.update(assestFrom);
      }
      /*
      if (!enoughMoney){
        throw new Error ('Not enough money!');
      }*/

      //update account credit
      //const assestTo = await query('selectWalletByOwner', {owner : 'resource:' + tx.ParticipantTo.getFullyQualifiedIdentifier()});
      /*const assestTo = await query(q, {owner : 'resource:' + tx.ParticipantTo.getFullyQualifiedIdentifier()});

      assestTo.forEach(async trade => {
        trade.money = trade.money + tx.value;
        await assestRegistry.update(trade);
      });*/
      const assestTo = await assestRegistry.get(tx.ParticipantTo.walletId);
      assestTo.money = assestTo.money + tx.value;
      await assestRegistry.update(assestTo);
    }
   catch(error){
     alert (error.message) ;
   }
}

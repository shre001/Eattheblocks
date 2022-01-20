const {expectRevert}= require("@openzeppelin/test-helpers");
const balance = require("@openzeppelin/test-helpers/src/balance");
const { web3 } = require("@openzeppelin/test-helpers/src/setup");
const Wallet = artifacts.require('Wallet');

contract('Wallet',(accounts)=>{
    let wallet;
    beforeEach(async()=>{
        wallet=await Wallet.new([accounts[0],accounts[1],accounts[2]],2);
        await web3.eth.sendTransaction({from:accounts[0],to: wallet.address, value:1000})
    });



    it('should have correct approvers and quorum', async()=>{
        const approvers =await wallet.getApprovers();
        const quorum = await wallet.quoram();
        assert(approvers.length===3);
        assert(approvers[0] === accounts[0]);
        assert(approvers[1] === accounts[1]);
        assert(quorum.toNumber()===2);

    });

    it("should create transfer",async()=>{
        await wallet.createTransfer(accounts[5],100, {from:accounts[0]});
        const transfer=await wallet.getTransfers();
        assert(transfer.length==1);
        assert(transfer[0].id==='0');
        assert(transfer[0].amount==100);
        assert(transfer[0].to===accounts[5]);
        assert(transfer[0].approvers==0);
        assert(transfer[0].sent===false);
    });

    it("should not create transfer",async()=>{
        await expectRevert(
             wallet.createTransfer(accounts[5],100, {from:accounts[4]}),
             "Only approvers allowed"
                );

    });

    it("sould increment approvals",async()=>{
    await wallet.createTransfer(accounts[5],100, {from:accounts[0]});
    await wallet.approveTransfer(0,{from:accounts[0]});
    const transfers=await wallet.getTransfers();
    assert(transfers[0].approvers==1);
    assert(transfers[0].sent===false);
    const balance=await web3.eth.getBalance(wallet.address);
    assert(balance==="1000");

    });

    it("should send money to recipient",async()=>{
        const balanceBefore=web3.utils.toBN(await web3.eth.getBalance(accounts[6]));
        await wallet.createTransfer(accounts[6],100, {from:accounts[0]});
        await wallet.approveTransfer(0,{from:accounts[0]});
        await wallet.approveTransfer(0,{from:accounts[1]});
        const balanceAfter=web3.utils.toBN(await web3.eth.getBalance(accounts[6]));
        assert(100==100);
        console.log(balanceAfter);
        console.log(balanceBefore);
        assert(balanceAfter.sub(balanceBefore).toNumber()===100);


    });

    it.only("identify fake approvers",async()=>{
        await wallet.createTransfer(accounts[5],100, {from:accounts[1]});
        await expectRevert( wallet.approveTransfer(0,{from:accounts[4]}),
        'Only approvers allowed');
        await wallet.approveTransfer(0,{from:accounts[1]});
        
    })

    it.only("should NOT approve transfer if its already sent",async()=>
    {
        await wallet.createTransfer(accounts[5],100,{from:accounts[1]});
        await wallet.approveTransfer(0,{from:accounts[1]});
        await wallet.approveTransfer(0,{from:accounts[2]});
        await expectRevert(wallet.approveTransfer(0,{from:accounts[0]}),
        'Transaction has already been sent');

    });

    it.only("should not approve transaction twice",async()=>{
        await wallet.createTransfer(accounts[5],100,{from:accounts[1]});
        await wallet.approveTransfer(0,{from:accounts[1]});
        await expectRevert( wallet.approveTransfer(0,{from:accounts[1]}),
        "Transaction cannot be approved twice");


    });

});    
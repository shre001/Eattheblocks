pragma solidity 0.6.0;
pragma experimental ABIEncoderV2;

contract Wallet{
   
   address[] public approvers;
   uint public quoram;
   
   struct Transfer{
       uint id;
       uint amount;
       address payable to;
       uint approvers;
       bool sent;
   }

   Transfer[] public transfers;
  

   mapping(address=>mapping(uint=>bool)) approvals;
   
    constructor(address[] memory  _approvers, uint _quoram) public{
        approvers=_approvers;
        quoram=_quoram;

    } 
    function getApprovers() external view returns(address[] memory){
        return approvers;
    }

    function getTransfers() external view returns(Transfer[] memory){
        return transfers;
    }

    function createTransfer(address payable to, uint amount) external onlyApprover{
        transfers.push(Transfer(
            transfers.length,
            amount,
            to,
            0,
            false
            ));
    }

    function approveTransfer(uint id) external onlyApprover{
        require(transfers[id].sent==false, "Transaction has already been sent");
        require(approvals[msg.sender][id]==false,"Transaction cannot be approved twice");
        
        //approve Transaction
        approvals[msg.sender][id]=true;
        transfers[id].approvers++;

        if(transfers[id].approvers>=quoram){
            address payable to=transfers[id].to;
            to.transfer(transfers[id].amount);

            transfers[id].sent=true;

        }
        
    }

    receive() external payable{

    }

//atleast one of the approvers should be the one who calls the contract
    modifier onlyApprover(){
        bool allowed=false;
        for(uint i=0; i<approvers.length;i++){
            if(approvers[i]==msg.sender){
            allowed=true;
        }

    }
    require(allowed==true,"Only approvers allowed");
    _;
}
}
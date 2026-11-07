// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract GrandmaGift {

    address public grandma;

    struct Grandchild {
        uint256 birthday;
        bool claimed;
    }

    mapping(address => Grandchild) public grandchilds;
    address[] public grandchildList;

    event Deposit(address indexed from, uint256 amount);
    event GrandchildAdded(address indexed child, uint256 birthday);
    event GiftClaimed(address indexed child, uint256 amount);

    constructor() {
        grandma = msg.sender;
    }

    modifier onlyGrandma() {
        require(msg.sender == grandma, "Only grandma can call");
        _;
    }

    function addGrandchild(
        address child,
        uint256 birthday
    ) public onlyGrandma {

        grandchilds[child] = Grandchild({
            birthday: birthday,
            claimed: false
        });

        grandchildList.push(child);

        emit GrandchildAdded(child, birthday);
    }

    function deposit()
        public
        payable
        onlyGrandma
    {
        require(msg.value > 0, "Send some ETH");

        emit Deposit(msg.sender, msg.value);
    }

    function claimGift() public {

        Grandchild storage child =
            grandchilds[msg.sender];

        require(
            child.birthday > 0,
            "Not registered"
        );

        require(
            block.timestamp >= child.birthday,
            "Birthday has not arrived yet"
        );

        require(
            !child.claimed,
            "Gift already claimed"
        );

        require(
            grandchildList.length > 0,
            "No grandchildren"
        );

        uint256 amount =
            address(this).balance /
            grandchildList.length;

        child.claimed = true;

        (bool success, ) =
            payable(msg.sender)
            .call{value: amount}("");

        require(
            success,
            "Transfer failed"
        );

        emit GiftClaimed(
            msg.sender,
            amount
        );
    }

    function getContractBalance()
        public
        view
        returns(uint256)
    {
        return address(this).balance;
    }

    function getGrandchildrenCount()
        public
        view
        returns(uint256)
    {
        return grandchildList.length;
    }
}
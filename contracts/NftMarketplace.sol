// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

/**
 * @title Decentralized NFT Marketplace
 * @author Original author Free Code Camp (Patrick Collins) used for learning purposes by 0xChristopher
 * @notice This contract is used to create a Decentralized NFT Marketplace.
 */

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/* Errors */
error NftMarketplace__PriceMustBeAboveZero();
error NftMarketplace__NotApprovedForMarketplace();
error NftMarketplace__AlreadyListed(address nftAddress, uint256 tokenId);
error NftMarketplace__NotOwner();
error NftMarketplace__NotListed(address nftAddress, uint256 tokenId);
error NftMarketplace__PriceNotMet(address nftAddress, uint256 tokenId, uint256 price);
error NftMarketplace__NoProceeds();
error NftMarketplace__TransferFailed();

contract NftMarketplace is ReentrancyGuard {
    /* State Variables */
    struct Listing {
        uint256 price;
        address seller;
    }

    /* Events */
    event ItemListed(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    event ItemBought(
        address indexed buyer,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    event ItemCancelled(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId
    );

    mapping(address => mapping(uint256 => Listing)) private s_listings;
    mapping(address => uint256) private s_proceeds;

    /* Modifiers */
    /**
     * @notice The notListed() modifier ensures an NFT is not listed before trying to
     * list it.
     */
    modifier notListed(
        address nftAddress,
        uint256 tokenId,
        address owner
    ) {
        Listing memory listing = s_listings[nftAddress][tokenId];

        if (listing.price > 0) {
            revert NftMarketplace__AlreadyListed(nftAddress, tokenId);
        }
        _;
    }

    /**
     * @notice The isListed() modifier ensures an NFT is listed before trying to interact
     * with it.
     */
    modifier isListed(address nftAddress, uint256 tokenId) {
        Listing memory listing = s_listings[nftAddress][tokenId];

        if (listing.price <= 0) {
            revert NftMarketplace__NotListed(nftAddress, tokenId);
        }
        _;
    }

    /**
     * @notice The isOwner() modifier ensures an NFT belongs to the user trying to interact with
     * it.
     */
    modifier isOwner(
        address nftAddress,
        uint256 tokenId,
        address spender
    ) {
        IERC721 nft = IERC721(nftAddress);
        address owner = nft.ownerOf(tokenId);

        if (spender != owner) {
            revert NftMarketplace__NotOwner();
        }
        _;
    }

    /* Functions */
    /**
     * @notice The listItem() function lists the user's NFT on the marketplace.
     * @param nftAddress: Address of the NFT
     * @param tokenId: Token ID of the NFT
     * @param price: Sale price of the NFT
     * @dev Alternatively, NFTs could be held by the marketplace; instead, this contract allows
     * the users to hold their NFTs when listed.
     */
    function listItem(
        address nftAddress,
        uint256 tokenId,
        uint256 price
    ) external notListed(nftAddress, tokenId, msg.sender) isOwner(nftAddress, tokenId, msg.sender) {
        if (price <= 0) {
            revert NftMarketplace__PriceMustBeAboveZero();
        }

        IERC721 nft = IERC721(nftAddress);

        if (nft.getApproved(tokenId) != address(this)) {
            revert NftMarketplace__NotApprovedForMarketplace();
        }

        s_listings[nftAddress][tokenId] = Listing(price, msg.sender);

        emit ItemListed(msg.sender, nftAddress, tokenId, price);
    }

    /**
     * @notice The buyItem() function allows users to purchase NFTs from the marketplace.
     * @param nftAddress: Address of the NFT
     * @param tokenId: Token ID of the NFT
     */
    function buyItem(address nftAddress, uint256 tokenId)
        external
        payable
        nonReentrant
        isListed(nftAddress, tokenId)
    {
        Listing memory listedItem = s_listings[nftAddress][tokenId];

        if (msg.value < listedItem.price) {
            revert NftMarketplace__PriceNotMet(nftAddress, tokenId, listedItem.price);
        }
        s_proceeds[listedItem.seller] = s_proceeds[listedItem.seller] + msg.value;

        delete (s_listings[nftAddress][tokenId]);
        IERC721(nftAddress).safeTransferFrom(listedItem.seller, msg.sender, tokenId);

        emit ItemBought(msg.sender, nftAddress, tokenId, listedItem.price);
    }

    /**
     * @notice The cancelListing() function allows users to cancel their NFT listings on
     * the marketplace.
     * @param nftAddress: Address of the NFT
     * @param tokenId: Token ID of the NFT
     */
    function cancelListing(address nftAddress, uint256 tokenId)
        external
        isOwner(nftAddress, tokenId, msg.sender)
        isListed(nftAddress, tokenId)
    {
        delete (s_listings[nftAddress][tokenId]);
        emit ItemCancelled(msg.sender, nftAddress, tokenId);
    }

    /**
     * @notice The updateListing() function allows users to update the price of their NFT listings on
     * the marketplace.
     * @param nftAddress: Address of the NFT
     * @param tokenId: Token ID of the NFT
     * @param newPrice: The new price of the NFT
     */
    function updateListing(
        address nftAddress,
        uint256 tokenId,
        uint256 newPrice
    ) external isListed(nftAddress, tokenId) isOwner(nftAddress, tokenId, msg.sender) {
        s_listings[nftAddress][tokenId].price = newPrice;
        emit ItemListed(msg.sender, nftAddress, tokenId, newPrice);
    }

    /**
     * @notice The withdrawProceeds() function allows users to withdraw their proceeds from
     * the marketplace.
     */
    function withdrawProceeds() external {
        uint256 proceeds = s_proceeds[msg.sender];

        if (proceeds <= 0) {
            revert NftMarketplace__NoProceeds();
        }

        s_proceeds[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: proceeds}("");

        if (!success) {
            revert NftMarketplace__TransferFailed();
        }
    }

    /**
     * @notice The getListing() function returns a particular listing.
     */
    function getListing(address nftAddress, uint256 tokenId)
        external
        view
        returns (Listing memory)
    {
        return s_listings[nftAddress][tokenId];
    }

    /**
     * @notice The getProceeds() function returns the current proceeds of the seller.
     */
    function getProceeds(address seller) external view returns (uint256) {
        return s_proceeds[seller];
    }
}

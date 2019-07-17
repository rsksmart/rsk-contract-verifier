pragma solidity ^0.5.0;

import 'openzeppelin-solidity/contracts/token/ERC721/ERC721Full.sol';
import 'openzeppelin-solidity/contracts/token/ERC721/ERC721Mintable.sol';

contract Test721 is ERC721Full, ERC721Mintable {
  constructor() ERC721Full("Test721", "TEST721") public {
  }
}
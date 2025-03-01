import React from 'react'
import styled from 'styled-components'

const Nav: React.FC = () => {
  return (
    <StyledNav>
      <StyledAbsoluteLink href="https://traphouse.vip">
        Traphouse
      </StyledAbsoluteLink>
      <StyledAbsoluteLink href="https://pancakeswap.info">
        Pancake Analytics
      </StyledAbsoluteLink>
    </StyledNav>
  )
}

const StyledNav = styled.nav`
  align-items: center;
  display: flex;
  font-size: 16px;
  line-height: 45px;
  font-weight: 500;
  @media (max-width: 600px) {
    display: none;
  }
`

const StyledAbsoluteLink = styled.a`
  color: #12aab5;
  padding-left: 10px;
  padding-right: 10px;
  text-decoration: none;
  &:hover {
    color: #204a87;
  }
  &.active {
    color: #204a87;
  }
  @media (max-width: 400px) {
    padding-left: 10px;
    padding-right: 10px;
  }
`

export default Nav

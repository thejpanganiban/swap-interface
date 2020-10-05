import { Currency, Token } from '@bscswap/sdk'
import React, { KeyboardEvent, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { useTranslation } from 'react-i18next'
import { Text } from 'rebass'
import { ThemeContext } from 'styled-components'
import Card from '../../components/Card'
import { useActiveWeb3React } from '../../hooks'
import { useAllTokens, useToken } from '../../hooks/Tokens'
import useInterval from '../../hooks/useInterval'
import { useAllTokenBalances, useTokenBalance } from '../../state/wallet/hooks'
import { CloseIcon, LinkStyledButton } from '../../theme'
import { isAddress } from '../../utils'
import Column from '../Column'
import Modal from '../Modal'
import QuestionHelper from '../QuestionHelper'
import { AutoRow, RowBetween } from '../Row'
import Tooltip from '../Tooltip'
import CommonBases from './CommonBases'
import { filterTokens } from './filtering'
import { useTokenComparator } from './sorting'
import { PaddedColumn, SearchInput } from './styleds'
import CurrencyList from './CurrencyList'
import SortButton from './SortButton'

interface CurrencySearchModalProps {
  isOpen?: boolean
  onDismiss?: () => void
  hiddenCurrency?: Currency
  showSendWithSwap?: boolean
  onCurrencySelect?: (currency: Currency) => void
  otherSelectedCurrency?: Currency
  showCommonBases?: boolean
}

export default function CurrencySearchModal({
  isOpen,
  onDismiss,
  onCurrencySelect,
  hiddenCurrency,
  showSendWithSwap,
  otherSelectedCurrency,
  showCommonBases = false
}: CurrencySearchModalProps) {
  const { t } = useTranslation()
  const { account, chainId } = useActiveWeb3React()
  const theme = useContext(ThemeContext)

  const [searchQuery, setSearchQuery] = useState<string>('')
  const [tooltipOpen, setTooltipOpen] = useState<boolean>(false)
  const [invertSearchOrder, setInvertSearchOrder] = useState<boolean>(false)
  const allTokens = useAllTokens()
  const allTokenBalances = useAllTokenBalances()

  const tokenComparator = useTokenComparator(invertSearchOrder)

  const filteredTokens: Token[] = useMemo(() => {
    return filterTokens(Object.values(allTokens), searchQuery)
  }, [allTokens, searchQuery])

  const filteredSortedTokens: Token[] = useMemo(() => {
    const sorted = filteredTokens.sort(tokenComparator)
    const symbolMatch = searchQuery
      .toLowerCase()
      .split(/\s+/)
      .filter(s => s.length > 0)
    if (symbolMatch.length > 1) return sorted

    return [
      // sort any exact symbol matches first
      ...sorted.filter(token => token.symbol.toLowerCase() === symbolMatch[0]),
      ...sorted.filter(token => token.symbol.toLowerCase() !== symbolMatch[0])
    ]
  }, [filteredTokens, searchQuery, tokenComparator])

  const handleCurrencySelect = useCallback(
    (currency: Currency) => {
      onCurrencySelect(currency)
      onDismiss()
    },
    [onDismiss, onCurrencySelect]
  )

  // clear the input on open
  useEffect(() => {
    if (isOpen) setSearchQuery('')
  }, [isOpen, setSearchQuery])

  // manage focus on modal show
  const inputRef = useRef<HTMLInputElement>()
  const handleInput = useCallback(event => {
    const input = event.target.value
    const checksummedInput = isAddress(input)
    setSearchQuery(checksummedInput || input)
    setTooltipOpen(false)
  }, [])

  const openTooltip = useCallback(() => {
    setTooltipOpen(true)
  }, [setTooltipOpen])
  const closeTooltip = useCallback(() => setTooltipOpen(false), [setTooltipOpen])

  useInterval(
    () => {
      setTooltipOpen(false)
    },
    tooltipOpen ? 4000 : null,
    false
  )

  const handleEnter = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && filteredSortedTokens.length > 0) {
        if (
          filteredSortedTokens[0].symbol.toLowerCase() === searchQuery.trim().toLowerCase() ||
          filteredSortedTokens.length === 1
        ) {
          handleCurrencySelect(filteredSortedTokens[0])
        }
      }
    },
    [filteredSortedTokens, handleCurrencySelect, searchQuery]
  )

  return (
    <Modal
      isOpen={isOpen}
      onDismiss={onDismiss}
      maxHeight={70}
      initialFocusRef={isMobile ? undefined : inputRef}
      minHeight={70}
    >
      <Column style={{ width: '100%' }}>
        <PaddedColumn gap="14px">
          <RowBetween>
            <Text fontWeight={500} fontSize={16}>
              {t('selectToken')}
              <QuestionHelper
                disabled={tooltipOpen}
                text={t('findAToken')}
              />
            </Text>
            <CloseIcon onClick={onDismiss} />
          </RowBetween>
            <SearchInput
              type="text"
              id="token-search-input"
              placeholder={t('tokenSearchPlaceholder')}
              value={searchQuery}
              ref={inputRef}
              onChange={handleInput}
              onFocus={closeTooltip}
              onBlur={closeTooltip}
              onKeyDown={handleEnter}
            />
          {showCommonBases && (
            <CommonBases chainId={chainId} onSelect={handleCurrencySelect} selectedCurrency={hiddenCurrency} />
          )}
          <RowBetween>
            <Text fontSize={14} fontWeight={500}>
              {t('tokenName')}
            </Text>
            <SortButton ascending={invertSearchOrder} toggleSortOrder={() => setInvertSearchOrder(iso => !iso)} />
          </RowBetween>
        </PaddedColumn>
        <div style={{ width: '100%', height: '1px', backgroundColor: theme.bg2 }} />
        <CurrencyList
          currencies={filteredSortedTokens}
          allBalances={allTokenBalances}
          onCurrencySelect={handleCurrencySelect}
          otherCurrency={otherSelectedCurrency}
          selectedCurrency={hiddenCurrency}
          showSendWithSwap={showSendWithSwap}
        />
        <div style={{ width: '100%', height: '1px', backgroundColor: theme.bg2 }} />
      </Column>
    </Modal>
  )
}

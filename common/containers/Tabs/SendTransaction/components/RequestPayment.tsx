import React from 'react';
import { connect } from 'react-redux';
import { AppState } from 'reducers';
import { translateRaw } from 'translations';
import { IWallet } from 'libs/wallet';
import { QRCode, TextArea } from 'components/ui';
import { getUnit, getDecimal } from 'selectors/transaction/meta';
import {
  getCurrentTo,
  getCurrentValue,
  ICurrentTo,
  ICurrentValue
} from 'selectors/transaction/current';
import BN from 'bn.js';
import { validNumber, validDecimal } from 'libs/validators';
import { getGasLimit } from 'selectors/transaction';
import { AddressField, AmountField, TXMetaDataPanel } from 'components';
import { SetGasLimitFieldAction } from 'actions/transaction/actionTypes/fields';
import { buildEIP681EtherRequest, buildEIP681TokenRequest } from 'libs/values';
import { getNetworkConfig, getSelectedTokenContractAddress, isNetworkUnit } from 'selectors/config';
import './RequestPayment.scss';
import { reset, TReset, setCurrentTo, TSetCurrentTo } from 'actions/transaction';
import { NetworkConfig } from 'types/network';

interface OwnProps {
  wallet: AppState['wallet']['inst'];
}

interface StateProps {
  unit: string;
  currentTo: ICurrentTo;
  currentValue: ICurrentValue;
  gasLimit: SetGasLimitFieldAction['payload'];
  networkConfig: NetworkConfig;
  decimal: number;
  tokenContractAddress: string;
  isNetworkUnit: boolean;
}

interface ActionProps {
  reset: TReset;
  setCurrentTo: TSetCurrentTo;
}

type Props = OwnProps & StateProps & ActionProps;

const isValidAmount = (decimal: number) => (amount: string) =>
  validNumber(+amount) && validDecimal(amount, decimal);

class RequestPayment extends React.Component<Props, {}> {
  public state = {
    recipientAddress: ''
  };

  public componentDidMount() {
    this.props.reset();
    if (this.props.wallet) {
      this.setWalletAsyncState(this.props.wallet);
    }
  }

  public componentWillUnmount() {
    this.props.reset();
  }

  public componentWillReceiveProps(nextProps: Props) {
    if (nextProps.wallet && this.props.wallet !== nextProps.wallet) {
      this.setWalletAsyncState(nextProps.wallet);
    }
  }

  public render() {
    const {
      tokenContractAddress,
      gasLimit,
      currentTo,
      currentValue,
      networkConfig,
      unit,
      decimal
    } = this.props;
    const chainId = networkConfig ? networkConfig.chainId : undefined;

    const eip681String = this.generateEIP681String(
      currentTo.raw,
      tokenContractAddress,
      currentValue,
      gasLimit,
      unit,
      decimal,
      chainId
    );

    return (
      <div className="RequestPayment">
        <div className="Tab-content-pane">
          <AddressField isReadOnly={true} />

          <div className="row form-group">
            <div className="col-xs-11">
              <AmountField
                hasUnitDropdown={true}
                showAllTokens={true}
                customValidator={isValidAmount(decimal)}
              />
            </div>
          </div>

          <div className="row form-group">
            <div className="col-xs-11">
              <TXMetaDataPanel
                initialState="advanced"
                disableToggle={true}
                advancedGasOptions={{
                  gasPriceField: false,
                  nonceField: false,
                  dataField: false,
                  feeSummary: false
                }}
              />
            </div>
          </div>

          {!!eip681String.length && (
            <div className="row form-group">
              <label className="RequestPayment-title">{translateRaw('Payment QR & Code')}</label>
              <div className="col-xs-6">
                <div className="RequestPayment-qr well well-lg">
                  <QRCode data={eip681String} />
                </div>
              </div>
              <div className="col-xs-6 RequestPayment-codeContainer">
                <TextArea className="RequestPayment-codeBox" value={eip681String} disabled={true} />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  private setWalletAsyncState(wallet: IWallet) {
    this.props.setCurrentTo(wallet.getAddressString());
  }

  private generateEIP681String(
    currentTo: string,
    tokenContractAddress: string,
    currentValue: { raw: string; value: BN | null },
    gasLimit: { raw: string; value: BN | null },
    unit: string,
    decimal: number,
    chainId?: number
  ) {
    if (
      !isValidAmount(decimal)(currentValue.raw) ||
      !chainId ||
      !gasLimit ||
      !gasLimit.raw.length ||
      !currentTo.length ||
      (unit !== 'ETH' && !tokenContractAddress.length)
    ) {
      return '';
    }

    const currentValueIsEther = (
      _: AppState['transaction']['fields']['value'] | AppState['transaction']['meta']['tokenTo']
    ): _ is AppState['transaction']['fields']['value'] => this.props.isNetworkUnit;

    if (currentValueIsEther(currentValue)) {
      return buildEIP681EtherRequest(currentTo, chainId, currentValue);
    } else {
      return buildEIP681TokenRequest(
        currentTo,
        tokenContractAddress,
        chainId,
        currentValue,
        decimal,
        gasLimit
      );
    }
  }
}

function mapStateToProps(state: AppState): StateProps {
  return {
    unit: getUnit(state),
    currentTo: getCurrentTo(state),
    currentValue: getCurrentValue(state),
    gasLimit: getGasLimit(state),
    networkConfig: getNetworkConfig(state),
    decimal: getDecimal(state),
    tokenContractAddress: getSelectedTokenContractAddress(state),
    isNetworkUnit: isNetworkUnit(state, getUnit(state))
  };
}

export default connect(mapStateToProps, { reset, setCurrentTo })(RequestPayment);

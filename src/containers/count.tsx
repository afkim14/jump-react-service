import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import countExample from '../components/count';
import { incrementCount, decrementCount } from '../store/actions/count';
import { StoreState } from '../store/types';

const mapStateToProps = (state: StoreState) => ({
    count: state.count,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    increment: () => dispatch(incrementCount()),
    decrement: () => dispatch(decrementCount()),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(countExample);

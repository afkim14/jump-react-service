import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import MainHome from '../views/MainHome';
import { setUser } from '../store/actions/user';
import { StoreState } from '../store/types';
import { UserDisplay } from '../constants/Types';

const mapStateToProps = (state: StoreState) => ({
    user: state.user,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    setUser: (user: UserDisplay) => dispatch(setUser(user)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(MainHome);

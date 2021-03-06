import React from 'react';
import usersStore from 'stores/users';
import topicsStore from 'stores/topics';
import postsStore from 'stores/posts';
import PostCard from 'components/PostCard';
import NewPost from 'components/NewPost';
import Spinner from 'components/common/Spinner';
import Animated from 'components/common/Animated';

export default React.createClass({
  mixins: [
    usersStore.connect('currentUser'),
    topicsStore.connect('topics'),
    postsStore.connect('postsLoading', 'posts')
  ],

  componentDidMount() {
    topicsStore.actions.fetchForUserRepo(this.props.params.login, this.props.params.repo);
    postsStore.actions.fetchForUserRepoTopic(this.props.params.login, this.props.params.repo, this.props.params.topic);
  },

  getInitialState() { return {}; },

  posted() {
    postsStore.actions.fetchForUserRepoTopic(this.props.params.login, this.props.params.repo, this.props.params.topic);
  },

  render() {
    const {topics, posts, currentUser} = this.state;
    const topic = topics && topics.find(topic => topic.number == this.props.params.topic);

    if (!topic) return <Spinner />;

    let tops;

    if (!posts || this.state.postsLoading) {
      tops = <Spinner />;
    } else if (posts.length) {
      tops = posts.map(post => {
        const showActions = currentUser && post.user.login === currentUser.login;
        const {login, repo} = this.props.params;
        const onDelete = () => postsStore.actions.deletePost(login, repo, topic.number, post.id).then(() => this.posted());
        const onEdit = body => postsStore.actions.updatePost(login, repo, topic.number, post.id, body).then(() => this.posted());
        return <Animated key={post.id}><PostCard {...{showActions, onDelete, onEdit, post}} /></Animated>;
      });
    } else {
      tops = 'No posts.';
    }

    return <div className="topic-posts-container" key={topic.id}>
      <h3>{topic.title}</h3>

      <div className="topic-posts">
        <div className="posts">{tops}</div>
        { currentUser 
          ? <NewPost user={currentUser} {...this.props.params} onDone={this.posted} />
          : <p>You must be logged in to comment</p>
        }
      </div>
    </div>;
  }
});

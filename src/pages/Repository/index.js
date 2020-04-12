import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import PropTypes from 'prop-types';
import { FaSpinner } from 'react-icons/fa';

import { Loading, Owner, IssuesList, ChangePage } from './styles';
import Container from '../../components/Container/style';

export default class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };
  state = {
    repository: {},
    issues: [],
    loading: true,
    filter: [
      { state: 'all', label: 'Todas', active: true },
      { state: 'closed', label: 'fechada', active: false },
      { state: 'open', label: 'Aberta', active: true },
    ],
    page: 1,
    filterIndex: 0,
  };

  async componentDidMount() {
    const { match } = this.props;

    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: this.state.filter.find(f => f.active).state,
          per_page: 5,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  loadIssues = async () => {
    const { match } = this.props;

    const { filter, filterIndex, page } = this.state;

    const repoName = decodeURIComponent(match.params.repository);

    const [repo, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: filter[filterIndex].state,
          per_page: 5,
          page,
        },
      }),
    ]);
    this.setState({ issues: issues.data });
  };

  async handleChanchePage(data) {
    const { page } = this.state;

    await this.setState({
      page: data === '-' ? page - 1 : page + 1,
    });
    this.loadIssues();
  }

  handleIndexFilter = async filterIndex => {
    this.setState({ filterIndex });
    this.loadIssues();
  };

  render() {
    const { repository, issues, loading } = this.state;

    if (loading) {
      return (
        <Loading>
          Carregando
          <FaSpinner color="#fff" size={34} />
        </Loading>
      );
    }
    return (
      <Container>
        <Owner>
          <Link to="/">Voltar ao repositorios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>
        <IssuesList>
          <ChangePage>
            {this.state.filter.map((f, index) => (
              <button
                key={f.label}
                onClick={() => {
                  this.handleIndexFilter(index);
                }}
              >
                {f.label}
              </button>
            ))}
          </ChangePage>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssuesList>
        <ChangePage>
          <button
            type="button"
            disabled={this.state.page === 1}
            onClick={() => {
              this.handleChanchePage('-');
            }}
          >
            Anterior
          </button>
          <button
            type="button"
            onClick={() => {
              this.handleChanchePage('+');
            }}
          >
            Proximo
          </button>
        </ChangePage>
      </Container>
    );
  }
}

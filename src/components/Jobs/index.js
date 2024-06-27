import {Component} from 'react'
import Loader from 'react-loader-spinner'
import Cookies from 'js-cookie'
import {BsSearch} from 'react-icons/bs'

import Header from '../Header'
import JobItem from '../JobItem'

import './index.css'

const employmentTypesList = [
  {
    label: 'Full Time',
    employmentTypeId: 'FULLTIME',
  },
  {
    label: 'Part Time',
    employmentTypeId: 'PARTTIME',
  },
  {
    label: 'Freelance',
    employmentTypeId: 'FREELANCE',
  },
  {
    label: 'Internship',
    employmentTypeId: 'INTERNSHIP',
  },
]

const salaryRangesList = [
  {
    salaryRangeId: '1000000',
    label: '10 LPA and above',
  },
  {
    salaryRangeId: '2000000',
    label: '20 LPA and above',
  },
  {
    salaryRangeId: '3000000',
    label: '30 LPA and above',
  },
  {
    salaryRangeId: '4000000',
    label: '40 LPA and above',
  },
]

const apiStatusConstants = {
  initial: 'INITIAL',
  success: 'SUCCESS',
  failure: 'FAILURE',
  inProgress: 'IN_PROGRESS',
}

class Jobs extends Component {
  state = {
    apiStatus: apiStatusConstants.initial,
    searchInput: '',
    jobsData: [],
    profileData: [],
    checkBoxInput: [],
    radioInput: '',
    apiJobStatus: apiStatusConstants.initial,
  }

  componentDidMount() {
    this.getProfileDetails()
    this.getJobDetails()
  }

  getProfileDetails = async () => {
    this.setState({
      apiStatus: apiStatusConstants.inProgress,
    })
    const jwtToken = Cookies.get('jwt_token')
    const profileUrl = 'https://apis.ccbp.in/profile'
    const optionsProfile = {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
      method: 'GET',
    }
    const response = await fetch(profileUrl, optionsProfile)
    if (response.ok) {
      const fetchedDataProfile = await response.json()
      const updatedData = {
        profileDetails: fetchedDataProfile.profile_details,
      }
      const updatedDataProfile = {
        name: updatedData.profileDetails.name,
        profileImageUrl: updatedData.profileDetails.profile_image_url,
        shortBio: updatedData.profileDetails.short_bio,
      }
      console.log(updatedDataProfile)
      this.setState({
        profileData: updatedDataProfile,
        apiStatus: apiStatusConstants.success,
        responseSuccess: true,
      })
    } else {
      this.setState({
        apiStatus: apiStatusConstants.failure,
      })
    }
  }

  getJobDetails = async () => {
    this.setState({
      apiJobStatus: apiStatusConstants.inProgress,
    })
    const jwtToken = Cookies.get('jwt_token')
    const {radioInput, checkBoxInput, searchInput} = this.state
    const apiUrlJob = `https://apis.ccbp.in/jobs?employment_type=${checkBoxInput}&minimum_package=${radioInput}&search=${searchInput}`
    const options = {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
      method: 'GET',
    }
    const response = await fetch(apiUrlJob, options)
    if (response.ok) {
      const fetchedDataJob = await response.json()
      const updatedDataJob = fetchedDataJob.jobs.map(each => ({
        companyLogoUrl: each.company_logo_url,
        employmentType: each.employment_type,
        id: each.id,
        jobDescription: each.job_description,
        location: each.location,
        packagePerAnnum: each.package_per_annum,
        rating: each.rating,
        title: each.title,
      }))
      this.setState({
        jobsData: updatedDataJob,
        apiJobStatus: apiStatusConstants.success,
      })
    } else {
      this.setState({
        apiJobStatus: apiStatusConstants.failure,
      })
    }
  }

  onGetRadioButton = event => {
    this.setState(
      {
        radioInput: event.target.id,
      },
      this.getJobDetails,
    )
  }

  onGetInputOption = event => {
    const {checkBoxInput} = this.state
    const inputNotInList = checkBoxInput.filter(
      each => each === event.target.id,
    )
    if (inputNotInList.length === 0) {
      this.setState(
        prevState => ({
          checkBoxInput: [...prevState.checkBoxInput, event.target.id],
        }),
        this.getJobDetails,
      )
    } else {
      const filteredData = checkBoxInput.filter(
        each => each !== event.target.id,
      )
      this.setState(
        {
          checkBoxInput: filteredData,
        },
        this.getJobDetails,
      )
    }
  }

  onGetProfileView = () => {
    const {profileData, responseSuccess} = this.state
    if (responseSuccess) {
      const {name, profileImageUrl, shortBio} = profileData
      return (
        <div className="profile-container">
          <img src={profileImageUrl} alt="profile" className="profile-icon" />
          <h1 className="profile-name">{name}</h1>
          <p className="profile-description">{shortBio}</p>
        </div>
      )
    }
    return null
  }

  onRetryProfile = () => {
    this.getProfileDetails()
  }

  onGetProfileFailureView = () => (
    <div className="failure-button-container">
      <button
        type="button"
        onClick={this.onRetryProfile}
        className="failure-button"
      >
        Retry
      </button>
    </div>
  )

  renderLoadingView = () => (
    <div className="loader-container" data-testid="loader">
      <Loader type="ThreeDots" color="#ffffff" height="50" width="50" />
    </div>
  )

  onRenderProfileStatus = () => {
    const {apiStatus} = this.state
    switch (apiStatus) {
      case apiStatusConstants.failure:
        return this.onGetProfileFailureView()
      case apiStatusConstants.success:
        return this.onGetProfileView()
      case apiStatusConstants.inProgress:
        return this.renderLoadingView()
      default:
        return null
    }
  }

  onRetryJobs = () => {
    this.getJobDetails()
  }

  onGetJobsFailureView = () => (
    <div className="failure-img-button-container">
      <img
        className="failure-img"
        src="https://assets.ccbp.in/frontend/react-js/failure-img.png"
        alt="failure view"
      />
      <h1 className="failure-heading">Oops! Something Went Wrong</h1>
      <p className="failure-paragraph">
        we cannot seem to find the page you are looking for
      </p>
      <div className="jobs-failure-button-container">
        <button
          type="button"
          onClick={this.onRetryJobs}
          className="failure-button"
        >
          Retry
        </button>
      </div>
    </div>
  )

  onGetJobsView = () => {
    const {jobsData} = this.state
    const noJobs = jobsData.length === 0

    return noJobs ? (
      <div className="no-jobs-container">
        <img
          src="https://assets.ccbp.in/frontend/react-js/no-jobs-img.png"
          alt="no jobs"
          className="no-jobs-img"
        />
        <h1>No jobs</h1>
        <p>We could not find any jobs. Try other filters.</p>
      </div>
    ) : (
      <ul className="ul-jobs-container">
        {jobsData.map(each => (
          <JobItem key={each.id} jobData={each} />
        ))}
      </ul>
    )
  }

  onRenderJobStatus = () => {
    const {apiJobStatus} = this.state
    switch (apiJobStatus) {
      case apiStatusConstants.failure:
        return this.onGetJobsFailureView()
      case apiStatusConstants.success:
        return this.onGetJobsView()
      case apiStatusConstants.inProgress:
        return this.renderLoadingView()
      default:
        return null
    }
  }

  onGetCheckBoxesView = () => (
    <ul className="check-box-container">
      {employmentTypesList.map(each => (
        <li className="li-container" key={each.employmentTypeId}>
          <input
            type="checkbox"
            className="input"
            onChange={this.onGetInputOption}
            id={each.employmentTypeId}
          />
          <label className="label" htmlFor={each.employmentTypeId}>
            {each.label}
          </label>
        </li>
      ))}
    </ul>
  )

  onGetRadioButtonView = () => (
    <ul className="radio-button-container">
      {salaryRangesList.map(each => (
        <li className="li-container" key={each.salaryRangeId}>
          <input
            type="radio"
            className="radio"
            name="option"
            onChange={this.onGetRadioButton}
            id={each.salaryRangeId}
          />
          <label className="label" htmlFor={each.salaryRangeId}>
            {each.label}
          </label>
        </li>
      ))}
    </ul>
  )

  onGetSearchInput = event => {
    this.setState({
      searchInput: event.target.value,
    })
  }

  onSubmitSearchInput = () => {
    this.getJobDetails()
  }

  onEnterSearchInput = event => {
    if (event.key === 'Enter') {
      this.getJobDetails()
    }
  }

  render() {
    const {checkBoxInput, searchInput, radioInput} = this.state
    return (
      <>
        <Header />
        <div className="all-jobs-container">
          <div className="side-bar-container">
            {this.onRenderProfileStatus()}
            <hr className="hr-line" />
            <h1 className="text">Type of Employment</h1>
            {this.onGetCheckBoxesView()}
            <hr className="hr-line" />
            <h1 className="text">Salary Range</h1>
            {this.onGetRadioButtonView()}
          </div>
          <div className="jobs-container">
            <div className="search-container">
              <input
                className="search-input"
                type="search"
                value={searchInput}
                placeholder="Search"
                onChange={this.onGetSearchInput}
                onKeyDown={this.onEnterSearchInput}
              />
              <button
                type="button"
                className="search-button"
                data-testid="searchButton"
                onClick={this.onSubmitSearchInput}
              >
                <BsSearch className="search-icon" />
              </button>
            </div>
            {this.onRenderJobStatus()}
          </div>
        </div>
      </>
    )
  }
}

export default Jobs

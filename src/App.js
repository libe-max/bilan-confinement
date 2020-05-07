import React, { Component } from 'react'
import Loader from 'libe-components/lib/blocks/Loader'
import LoadingError from 'libe-components/lib/blocks/LoadingError'
import ShareArticle from 'libe-components/lib/blocks/ShareArticle'
import LibeLaboLogo from 'libe-components/lib/blocks/LibeLaboLogo'
import ArticleMeta from 'libe-components/lib/blocks/ArticleMeta'
import PageTitle from 'libe-components/lib/text-levels/PageTitle'
import ParagraphTitle from 'libe-components/lib/text-levels/ParagraphTitle'
import SectionTitle from 'libe-components/lib/text-levels/SectionTitle'
import BlockTitle from 'libe-components/lib/text-levels/BlockTitle'
import Slug from 'libe-components/lib/text-levels/Slug'
import Paragraph from 'libe-components/lib/text-levels/Paragraph'
import Annotation from 'libe-components/lib/text-levels/Annotation'
import JSXInterpreter from 'libe-components/lib/logic/JSXInterpreter'
import { parseTsv } from 'libe-utils'

export default class App extends Component {
  /* * * * * * * * * * * * * * * * *
   *
   * CONSTRUCTOR
   *
   * * * * * * * * * * * * * * * * */
  constructor () {
    super()
    this.c = 'bilan-confinement'
    this.state = {
      loading_sheet: true,
      error_sheet: null,
      data_sheet: [],
      keystrokes_history: [],
      konami_mode: false
    }
    this.fetchSheet = this.fetchSheet.bind(this)
    this.fetchCredentials = this.fetchCredentials.bind(this)
    this.listenToKeyStrokes = this.listenToKeyStrokes.bind(this)
    this.watchKonamiCode = this.watchKonamiCode.bind(this)
    this.makeAnchorsSticky = this.makeAnchorsSticky.bind(this)
  }

  /* * * * * * * * * * * * * * * * *
   *
   * DID MOUNT
   *
   * * * * * * * * * * * * * * * * */
  componentDidMount () {
    document.addEventListener('keydown', this.listenToKeyStrokes)
    document.addEventListener('scroll', this.makeAnchorsSticky)
    this.fetchCredentials()
    if (this.props.spreadsheet) return this.fetchSheet()
    return this.setState({ loading_sheet: false })
  }

  /* * * * * * * * * * * * * * * * *
   *
   * WILL UNMOUNT
   *
   * * * * * * * * * * * * * * * * */
  componentWillUnmount () {
    document.removeEventListener('keydown', this.listenToKeyStrokes)
    document.removeEventListener('scroll', this.makeAnchorsSticky)
  }

  /* * * * * * * * * * * * * * * * *
   *
   * SHOULD UPDATE
   *
   * * * * * * * * * * * * * * * * */
  shouldComponentUpdate (props, nextState) {
    const changedKeys = []
    Object.keys(nextState).forEach(key => {
      if (this.state[key] !== nextState[key]) changedKeys.push(key)
    })
    if (changedKeys.length === 1 &&
      changedKeys.includes('keystrokes_history')) return false
    return true
  }

  /* * * * * * * * * * * * * * * * *
   *
   * FETCH CREDENTIALS
   *
   * * * * * * * * * * * * * * * * */
  async fetchCredentials () {
    const { api_url } = this.props
    const { format, article } = this.props.tracking
    const api = `${api_url}/${format}/${article}/load`
    try {
      const reach = await window.fetch(api, { method: 'POST' })
      const response = await reach.json()
      const { lblb_tracking, lblb_posting } = response._credentials
      if (!window.LBLB_GLOBAL) window.LBLB_GLOBAL = {}
      window.LBLB_GLOBAL.lblb_tracking = lblb_tracking
      window.LBLB_GLOBAL.lblb_posting = lblb_posting
      return { lblb_tracking, lblb_posting }
    } catch (error) {
      console.error('Unable to fetch credentials:')
      console.error(error)
      return Error(error)
    }
  }

  /* * * * * * * * * * * * * * * * *
   *
   * FETCH SHEET
   *
   * * * * * * * * * * * * * * * * */
  async fetchSheet () {
    this.setState({ loading_sheet: true, error_sheet: null })
    const sheet = this.props.spreadsheet
    try {
      const reach = await window.fetch(this.props.spreadsheet)
      if (!reach.ok) throw reach
      const data = await reach.text()
      const parsedData = parseTsv(data, [7])[0].filter(line => line.active === '1')
      this.setState({ loading_sheet: false, error_sheet: null, data_sheet: parsedData })
      return data
    } catch (error) {
      if (error.status) {
        const text = `${error.status} error while fetching : ${sheet}`
        this.setState({ loading_sheet: false, error_sheet: error })
        console.error(text, error)
        return Error(text)
      } else {
        this.setState({ loading_sheet: false, error_sheet: error })
        console.error(error)
        return Error(error)
      }
    }
  }

  /* * * * * * * * * * * * * * * * *
   *
   * START LISTENING KEYSTROKES
   *
   * * * * * * * * * * * * * * * * */
  listenToKeyStrokes (e) {
    if (!e || !e.keyCode) return
    const currHistory = this.state.keystrokes_history
    const newHistory = [...currHistory, e.keyCode]
    this.setState({ keystrokes_history: newHistory })
    this.watchKonamiCode()
  }

  /* * * * * * * * * * * * * * * * *
   *
   * WATCH KONAMI CODE
   *
   * * * * * * * * * * * * * * * * */
  watchKonamiCode () {
    const konamiCodeStr = '38,38,40,40,37,39,37,39,66,65'
    const lastTenKeys = this.state.keystrokes_history.slice(-10)
    if (lastTenKeys.join(',') === konamiCodeStr) this.setState({ konami_mode: true })
  }

  makeAnchorsSticky (e) {
    const $anchors = document.querySelector(`.${this.c}__anchors`)
    if (!$anchors) return
    const anchorsHeight = $anchors.getBoundingClientRect().height
    const $articles = document.querySelector(`.${this.c}__article`)
    const articlesHeight = $articles.getBoundingClientRect().height
    const articleDistanceToTop = $articles.getBoundingClientRect().top
    const navHeight = window.LBLB_GLOBAL.nav_height + 1 * window.LBLB_GLOBAL.rem
    const distanceFromArticlesTop = -1 * (articleDistanceToTop - navHeight)
    const anchorsTopProp = `${distanceFromArticlesTop}px`
    if (distanceFromArticlesTop > 0 && distanceFromArticlesTop + anchorsHeight < articlesHeight) {
      $anchors.style.top = anchorsTopProp
    } else if (distanceFromArticlesTop + anchorsHeight > articlesHeight) {
      $anchors.style.top = `${articlesHeight - anchorsHeight}px`
    } else {
      $anchors.style.top = '0px'
    }
  }

  /* * * * * * * * * * * * * * * * *
   *
   * RENDER
   *
   * * * * * * * * * * * * * * * * */
  render () {
    const { c, state, props } = this
    const { data_sheet: data } = state

    /* Logic */
    const navHeight = window.LBLB_GLOBAL.nav_height
    const rem = window.LBLB_GLOBAL.rem

    const filteredSlugs = data.filter(line => line.type === 'slug')
    const filteredTitles = data.filter(line => line.type === 'h1')
    const filteredIntros = data.filter(line => line.type === 'intro')
    const slug = filteredSlugs.length ? filteredSlugs[0].content : undefined
    const title = filteredTitles.length ? filteredTitles[0].content : undefined
    const intro = filteredIntros.length ? filteredIntros[0].content : undefined

    const anchors = data
      .filter(line => line.type === 'h2' || line.type === 'h3')
      .map((line, i) => line.type === 'h2'
        ? <ParagraphTitle key={i} small>
          <a href={`#${line.content}`}>
            <JSXInterpreter content={line.anchor || line.content} />
          </a>
        </ParagraphTitle>
        : <Paragraph key={i} small>
          <a href={`#${line.content}`}>
            <JSXInterpreter content={line.anchor || line.content} />
          </a>
        </Paragraph>)

    const content = data
      .filter(line => line.type !== 'slug' && line.type !== 'h1' && line.type !== 'intro')
      .map((line, i) => {
        const lgCss = line.lg_css ? JSON.parse(line.lg_css) : {}
        const mdCss = line.md_css ? JSON.parse(line.md_css) : {}
        const smCss = line.sm_css ? JSON.parse(line.sm_css) : {}
        const display = window.LBLB_GLOBAL.current_display
        const style = display === 'lg'
          ? { ...lgCss }
          : display === 'md'
          ? { ...lgCss, ...mdCss }
          : display === 'sm'
          ? { ...lgCss, ...mdCss, ...smCss }
          : {}
        return line.type === 'h2'
          ? <span
            key={i}
            id={line.content}
            style={{ scrollMarginTop: `${navHeight + rem}px` }}
            className={`${c}__h2`}>
            <SectionTitle level={2}>
              <span style={style}>
                <JSXInterpreter content={line.content} />
              </span>
            </SectionTitle>
          </span>
          : line.type === 'h3'
          ? <span
            key={i}
            id={line.content}
            style={{ scrollMarginTop: `${navHeight + rem}px` }}
            className={`${c}__h3`}>
            <BlockTitle big level={3}>
              <span style={style}>
                <JSXInterpreter content={line.content} />
              </span>
            </BlockTitle>
          </span>
          : line.type === 'h4'
          ? <span
            key={i}
            className={`${c}__h4`}>
            <Paragraph level={4}>
              <span style={style}>
                <JSXInterpreter content={line.content} />
              </span>
            </Paragraph>
          </span>
          : line.type === 'paragraph'
          ? <span
            key={i}
            className={`${c}__paragraph`}>
            <Paragraph literary>
              <span style={style}>
                <JSXInterpreter content={line.content} />
              </span>
            </Paragraph>
          </span>
          : line.type === 'annotation'
          ? <span
            key={i}
            className={`${c}__annotation`}>
            <Annotation>
              <span style={style}>
                <JSXInterpreter content={line.content} />
              </span>
            </Annotation>
          </span>
          : line.type === 'image'
          ? <span className={`${c}__image`}>
            <img src={line.content} style={style} key={i} />
          </span>
          : ''
      })

    /* Assign classes */
    const classes = [c]
    if (state.loading_sheet) classes.push(`${c}_loading`)
    if (state.error_sheet) classes.push(`${c}_error`)

    /* Load & errors */
    if (state.loading_sheet) return <div className={classes.join(' ')}><div className='lblb-default-apps-loader'><Loader /></div></div>
    if (state.error_sheet) return <div className={classes.join(' ')}><div className='lblb-default-apps-error'><LoadingError /></div></div>

    /* Display component */
    return <div className={classes.join(' ')}>
      <div
        style={{ top: `${navHeight + rem}px` }}
        className={`${c}__fixed-logo`}>
        <LibeLaboLogo />
      </div>
      <div className={`${c}__header`}>
        <div className={`${c}__header-inner`}>
          <Slug huge>{slug}</Slug>
          <PageTitle small>{title}</PageTitle>
          <Paragraph
            big
            literary>
            <JSXInterpreter content={intro} />
          </Paragraph>
          <ArticleMeta
            publishedOn='08/05/2020 10:12'
            authors={[{ name: 'Libé Labo', role: 'Production', link: 'https://www.liberation.fr/libe-labo-data-nouveaux-formats,100538' }]} />
          <ShareArticle
            short
            iconsOnly
            tweet={props.meta.tweet}
            url={props.meta.url} />
        </div>
      </div>
      <div className={`${c}__article`}>
        <div className={`${c}__anchors`}>{anchors}</div>
        <div className={`${c}__content`}>{content}</div>
      </div>
      <div className='lblb-default-apps-footer'>
        <ShareArticle short iconsOnly tweet={props.meta.tweet} url={props.meta.url} />
        <ArticleMeta
          publishedOn='08/05/2020 10:12'
          authors={[
            { name: 'Baptiste Bouthier', role: '', link: 'https://www.liberation.fr/auteur/12359-baptiste-bouthier' },
            { name: 'Aurélie Delmas', role: '', link: 'https://www.liberation.fr/auteur/13202-aurelie-delmas' },
            { name: 'Julien Guillot', role: '', link: 'https://www.liberation.fr/auteur/15107-julien-guillot' },
            { name: 'Alice Clair', role: 'Infographies', link: 'https://www.liberation.fr/auteur/20783-alice-clair' },
            { name: 'Julien Guillot', role: 'Infographies', link: 'https://www.liberation.fr/auteur/15107-julien-guillot' },
            { name: 'Christelle Perrin', role: 'Infographies', link: 'https://www.liberation.fr/auteur/20527-christelle-perrin' },
            { name: 'Maxime Fabas', role: 'Design et développement', link: 'https://www.liberation.fr/auteur/19310-maxime-fabas' },
            { name: 'Libé Labo', role: 'Production', link: 'https://www.liberation.fr/libe-labo-data-nouveaux-formats,100538' }
          ]} />
        <LibeLaboLogo target='blank' />
      </div>
    </div>
  }
}

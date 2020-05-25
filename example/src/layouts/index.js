import React from "react";
import { Link, useStaticQuery, graphql } from "gatsby";
import { useWindowWidth } from "@react-hook/window-size";
import {
  useStackedPagesProvider,
  LinkToStacked,
} from "react-stacked-pages-hook";
import { dataToNote } from "./data-to-note";
import Note from "../components/Note";
import { DarkModeToggle } from "../components/DarkModeToggle";

import "./layout.css";

function noteContainerClassName(overlay, obstructed) {
  return `note-container ${overlay ? "note-container-overlay" : ""} ${
    obstructed ? "note-container-obstructed" : ""
  }`;
}

const NoteWrapper = ({
  PageIndexProvider,
  children,
  slug,
  title,
  i,
  overlay,
  obstructed,
}) => (
  <PageIndexProvider value={i}>
    <div
      className={noteContainerClassName(overlay, obstructed)}
      style={{ left: 40 * (i || 0), right: -585 }}
    >
      <div className="note-content">{children}</div>
      <LinkToStacked to={slug} className="obstructed-label">
        {title}
      </LinkToStacked>
    </div>
  </PageIndexProvider>
);

const processPageQuery = (x) => dataToNote(x.json.data);

const NotesLayout = ({ children, location, slug, title }) => {
  const gatsbyData = useStaticQuery(graphql`
    query {
      site {
        siteMetadata {
          title
        }
      }
    }
  `);

  const windowWidth = useWindowWidth();

  const [
    stackedPages,
    stackedPageStates,
    navigateToStackedPage,
    ContextProvider,
    PageIndexProvider,
    scrollContainer,
  ] = useStackedPagesProvider({
    firstPageSlug: slug,
    location,
    processPageQuery,
    pageWidth: 625,
  });

  return (
    <div className="layout">
      <header>
        <Link to="/">
          <h3>{gatsbyData.site.siteMetadata.title}</h3>
        </Link>
        <DarkModeToggle />
      </header>

      <div className="note-columns-scrolling-container" ref={scrollContainer}>
        <div
          className="note-columns-container"
          style={{ width: 625 * (stackedPages.length + 1) }}
        >
          <ContextProvider value={{ stackedPages, navigateToStackedPage }}>
            {windowWidth > 800 ? (
              <React.Fragment>
                <NoteWrapper
                  PageIndexProvider={PageIndexProvider}
                  i={0}
                  slug={slug}
                  title={title}
                  overlay={
                    stackedPageStates[slug] && stackedPageStates[slug].overlay
                  }
                  obstructed={
                    stackedPageStates[slug] &&
                    stackedPageStates[slug].obstructed
                  }
                >
                  {children}
                </NoteWrapper>
                {stackedPages.map((page, i) => (
                  <NoteWrapper
                    key={page.slug}
                    PageIndexProvider={PageIndexProvider}
                    i={i + 1}
                    slug={page.slug}
                    title={page.data.title}
                    overlay={
                      stackedPageStates[page.slug] &&
                      stackedPageStates[page.slug].overlay
                    }
                    obstructed={
                      stackedPageStates[page.slug] &&
                      stackedPageStates[page.slug].obstructed
                    }
                  >
                    <Note {...page.data} />
                  </NoteWrapper>
                ))}
              </React.Fragment>
            ) : !stackedPages.length ? (
              <NoteWrapper
                PageIndexProvider={PageIndexProvider}
                i={0}
                slug={slug}
                title={title}
              >
                {children}
              </NoteWrapper>
            ) : (
              <NoteWrapper
                PageIndexProvider={PageIndexProvider}
                i={stackedPages.length - 1}
                slug={stackedPages[stackedPages.length - 1].slug}
                title={stackedPages[stackedPages.length - 1].data.title}
              >
                <Note {...stackedPages[stackedPages.length - 1].data} />
              </NoteWrapper>
            )}
          </ContextProvider>
        </div>
      </div>

      {/*<footer>
      The source for this website is on
      {` `}
      <a href="https://github.com/mathieudutour/gatsby-n-roamresearch/tree/master/example">
        GitHub
      </a>
      .
    </footer>*/}
    </div>
  );
};

export default NotesLayout;
